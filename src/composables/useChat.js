import { ref, shallowReactive } from 'vue'

// on и send передаём явно — inject не работает в том же компоненте, где вызван provide.
export function useChat({ on, send }) {
  const rooms = ref([]) // список всех комнат ['general', 'random', ...]
  const currentRoom = ref(null) // имя текущей комнаты
  const messages = ref([]) // сообщения текущей комнаты

  // Кэш историй по комнатам: { general: [...], random: [...] }
  // shallowReactive — Vue отслеживает добавление/удаление ключей,
  // но не уходит вглубь массивов. Глубину отслеживает messages = ref([]).
  const messagesByRoom = shallowReactive({})

  const onlineUsers = ref([]) // ['Alex', 'Maria'] — онлайн в текущей комнате

  // --- Действия ---

  function joinRoom(room) {
    if (currentRoom.value === room) return
    currentRoom.value = room
    // Показываем закэшированную историю пока сервер не пришлёт свежую
    messages.value = messagesByRoom[room] ?? []
    onlineUsers.value = []
    send({ type: 'join', room })
  }

  function sendMessage(text) {
    send({ type: 'message', text, id: crypto.randomUUID() })
  }

  function react(messageId, emoji) {
    send({ type: 'react', messageId, emoji })
  }

  function createRoom(name) {
    send({ type: 'create', room: name })
  }

  // --- Обработчики входящих сообщений ---

  // Сервер прислал историю после join
  on('history', ({ messages: hist }) => {
    messagesByRoom[currentRoom.value] = hist
    messages.value = hist
  })

  // Новое сообщение в текущей комнате
  on('message', (msg) => {
    messages.value.push(msg)
  })

  // Кто-то поставил реакцию
  on('react', ({ messageId, emoji }) => {
    const m = messages.value.find((m) => m.id === messageId)
    if (!m) return
    // ??= — если reactions ещё нет, создаём объект
    m.reactions ??= {}
    m.reactions[emoji] = (m.reactions[emoji] ?? 0) + 1
  })

  // Обновлённый список онлайн-пользователей
  on('users', ({ list }) => {
    onlineUsers.value = list
  })

  // Кто-то создал новую комнату — добавляем в список
  on('room_created', ({ room }) => {
    if (!rooms.value.includes(room)) {
      rooms.value.push(room)
    }
  })

  return { rooms, currentRoom, messages, onlineUsers, joinRoom, sendMessage, react, createRoom }
}
