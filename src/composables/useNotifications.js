import { ref, reactive } from 'vue'

export function useNotifications({ on }) {
  const unread = reactive({}) // { general: 2, random: 1 }
  const toasts = ref([]) // [{ id, text }, ...]

  function toast(text) {
    toasts.value.push({ id: crypto.randomUUID(), text })
  }

  function dismissToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function clearUnread(room) {
    delete unread[room]
  }

  // 'notify' — специальный тип от сервера, шлётся клиентам не в этой комнате
  on('notify', ({ room, from, text }) => {
    unread[room] = (unread[room] ?? 0) + 1
    toast(`${from} в #${room}: ${text.slice(0, 40)}`)
  })

  return { unread, toasts, clearUnread, toast, dismissToast }
}
