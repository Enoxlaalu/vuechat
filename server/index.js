import { WebSocketServer } from 'ws'
import { randomUUID } from 'crypto'

const ALLOWED_EMOJI = ['👍', '❤️', '😂', '😮', '😢']

const PORT = 8080

// Всё состояние — в памяти. При перезапуске сервера всё сбрасывается.
//
// rooms: Map<roomId, { name: string, messages: [], members: Set<ws> }>
//   members — это Set живых WebSocket-соединений, не имён.
//   Так мы можем итерироваться по ним и слать сообщения.
//
// clients: Map<ws, { username: string, room: string|null }>
//   Обратный индекс: по соединению узнаём, кто это и в какой комнате.

const rooms = new Map()
const clients = new Map()

// Создаём комнаты по умолчанию — они всегда есть при старте сервера.
rooms.set('general', { name: 'general', messages: [], members: new Set() })
rooms.set('random', { name: 'random', messages: [], members: new Set() })

const wss = new WebSocketServer({ port: PORT })

// --- Вспомогательные функции ---

// Отправить JSON одному клиенту.
function send(ws, data) {
  ws.send(JSON.stringify(data))
}

// Разослать JSON всем участникам комнаты, кроме отправителя (если указан).
function broadcast(roomId, data, exclude = null) {
  const room = rooms.get(roomId)
  if (!room) return
  for (const member of room.members) {
    if (member !== exclude && member.readyState === 1) {
      member.send(JSON.stringify(data))
    }
  }
}

// Разослать обновлённый список онлайн-пользователей всем в комнате.
function broadcastUsers(roomId) {
  const room = rooms.get(roomId)
  if (!room) return
  const list = [...room.members].map((ws) => clients.get(ws)?.username).filter(Boolean)
  broadcast(roomId, { type: 'users', list })
}

// --- Основной обработчик соединений ---

wss.on('connection', (ws) => {
  // Регистрируем нового клиента. username и room заполним после auth/join.
  clients.set(ws, { username: null, room: null })

  ws.on('message', (raw) => {
    let msg
    try {
      msg = JSON.parse(raw)
    } catch {
      return
    }

    const client = clients.get(ws)

    // type: 'auth' — первое сообщение от клиента, устанавливает имя пользователя.
    // Сервер отвечает списком доступных комнат.
    if (msg.type === 'auth') {
      const username = String(msg.username ?? '').trim().slice(0, 32)
      if (!username) return
      client.username = username
      send(ws, {
        type: 'auth_ok',
        rooms: [...rooms.keys()],
      })
      return
    }

    // type: 'join' — войти в комнату.
    // 1. Убираем клиента из текущей комнаты (если был).
    // 2. Добавляем в новую.
    // 3. Отдаём историю сообщений.
    // 4. Рассылаем обновлённый список пользователей.
    if (msg.type === 'join') {
      if (!client.username) return
      const roomId = String(msg.room ?? '').trim().slice(0, 32)
      if (!roomId) return

      // Покидаем старую комнату
      if (client.room) {
        const oldRoom = rooms.get(client.room)
        oldRoom?.members.delete(ws)
        broadcastUsers(client.room)
      }

      // Создаём комнату если её нет
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { name: roomId, messages: [], members: new Set() })
      }

      const room = rooms.get(roomId)
      room.members.add(ws)
      client.room = roomId

      // Отдаём историю только этому клиенту
      send(ws, { type: 'history', messages: room.messages })

      // Рассылаем всем в комнате (включая нового участника) обновлённый список
      broadcastUsers(roomId)
      return
    }

    // type: 'message' — обычное текстовое сообщение.
    // Сервер добавляет from и timestamp, сохраняет в историю, рассылает в комнату.
    if (msg.type === 'message') {
      if (!client.room || !client.username) return
      const text = String(msg.text ?? '').trim().slice(0, 2000)
      if (!text) return

      const message = {
        type: 'message',
        id: randomUUID(),
        from: client.username,
        room: client.room,
        text,
        timestamp: Date.now(),
        reactions: {},
      }
      rooms.get(client.room).messages.push(message)
      // Рассылаем сообщение всем в комнате (чтобы они видели сообщение)
      broadcast(client.room, message)
      // Рассылаем уведомление всем остальным подключённым клиентам не в этой комнате —
      // чтобы они могли показать unread badge
      for (const [memberWs, memberClient] of clients) {
        if (memberClient.room !== client.room && memberWs.readyState === 1) {
          memberWs.send(JSON.stringify({ ...message, type: 'notify' }))
        }
      }
      return
    }

    // type: 'react' — реакция на сообщение (emoji).
    // Сервер находит сообщение в истории, обновляет счётчик, рассылает в комнату.
    if (msg.type === 'react') {
      if (!client.room) return
      if (typeof msg.messageId !== 'string' || !ALLOWED_EMOJI.includes(msg.emoji)) return
      const room = rooms.get(client.room)
      const message = room.messages.find((m) => m.id === msg.messageId)
      if (!message) return
      message.reactions[msg.emoji] = (message.reactions[msg.emoji] ?? 0) + 1
      broadcast(client.room, {
        type: 'react',
        messageId: msg.messageId,
        emoji: msg.emoji,
        from: client.username,
      })
      return
    }

    // type: 'typing' — индикатор печати. Не сохраняется, просто пересылается.
    if (msg.type === 'typing') {
      if (!client.room) return
      broadcast(
        client.room,
        {
          type: 'typing',
          from: client.username,
          isTyping: msg.isTyping,
        },
        ws,
      ) // exclude: не слать самому себе
      return
    }

    // type: 'create' — создать новую комнату.
    // Рассылаем всем подключённым клиентам (не только в комнате).
    if (msg.type === 'create') {
      const roomId = String(msg.room ?? '').trim().slice(0, 32)
      if (!roomId || rooms.has(roomId)) return
      rooms.set(roomId, { name: roomId, messages: [], members: new Set() })
      for (const client of wss.clients) {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'room_created', room: roomId }))
        }
      }
      return
    }
  })

  // Клиент отключился — убираем из комнаты и обновляем список пользователей.
  ws.on('close', () => {
    const client = clients.get(ws)
    if (client?.room) {
      const room = rooms.get(client.room)
      room?.members.delete(ws)
      broadcastUsers(client.room)
    }
    clients.delete(ws)
  })
})

console.log(`WebSocket server running on ws://localhost:${PORT}`)
