import { ref, reactive, computed, onUnmounted } from 'vue'

// on и send передаём явно — inject не работает в том же компоненте, где вызван provide.
export function useChat({ on, send }) {
  const rooms = ref([]) // список всех комнат ['general', 'random', ...]
  const currentRoom = ref(null) // имя текущей комнаты

  // Кэш историй по комнатам: { general: [...], random: [...] }
  const messagesByRoom = reactive({})

  const messages = computed(() => messagesByRoom[currentRoom.value] ?? [])

  const onlineUsers = ref([]) // ['Alex', 'Maria'] — онлайн в текущей комнате
  const typingUsers = ref([])
  let stopTimer = null

  // --- Действия ---

  function joinRoom(room) {
    if (currentRoom.value === room) return
    clearTimeout(stopTimer)
    currentRoom.value = room
    onlineUsers.value = []
    typingUsers.value = []
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
  on('history', ({ room, messages: hist }) => {
    messagesByRoom[room] = hist
  })

  // Новое сообщение в текущей комнате
  on('message', (msg) => {
    const room = msg.room
    if (!room) return
    if (!messagesByRoom[room]) messagesByRoom[room] = []
    messagesByRoom[room].push(msg)
  })

  // Кто-то поставил реакцию
  on('react', ({ messageId, emoji }) => {
    const list = messagesByRoom[currentRoom.value]
    if (!list) return
    const m = list.find((m) => m.id === messageId)
    if (!m) return
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

  on('typing', ({ from, isTyping }) => {
    if (isTyping) {
      typingUsers.value = [...new Set([...typingUsers.value, from])]
    } else {
      typingUsers.value = typingUsers.value.filter(u => u !== from)
    }
  })

  const typingText = computed(() => {
    const u = typingUsers.value
    if (!u.length) return ''
    if (u.length === 1) return `${u[0]} печатает...`
    return `${u.slice(0, -1).join(', ')} и ${u.at(-1)} печатают...`
  })

  function onInput() {
    send({ type: 'typing', isTyping: true })
    clearTimeout(stopTimer)
    stopTimer = setTimeout(() => {
      send({ type: 'typing', isTyping: false })
    }, 1500)
  }

  onUnmounted(() => clearTimeout(stopTimer))

  return { rooms, currentRoom, messages, onlineUsers, joinRoom, sendMessage, react, createRoom, typingText, onInput }
}
