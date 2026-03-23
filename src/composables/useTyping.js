import { ref, computed, onUnmounted } from 'vue'

export function useTyping({ on, send }) {
  const typingUsers = ref([]) // ['Alex', 'Maria']
  let stopTimer = null

  // Вызывается при каждом нажатии клавиши в MessageInput.
  // Шлём isTyping: true, и запускаем таймер — если 1.5с нет новых нажатий,
  // шлём isTyping: false. Это классический debounce вручную.
  function onInput() {
    send({ type: 'typing', isTyping: true })
    clearTimeout(stopTimer)
    stopTimer = setTimeout(() => {
      send({ type: 'typing', isTyping: false })
    }, 1500)
  }

  on('typing', ({ from, isTyping }) => {
    if (isTyping) {
      // Set убирает дубликаты если одно имя придёт дважды
      typingUsers.value = [...new Set([...typingUsers.value, from])]
    } else {
      typingUsers.value = typingUsers.value.filter(u => u !== from)
    }
  })

  // computed пересчитывается автоматически когда меняется typingUsers.
  // В шаблоне используем как обычное свойство — без .value и без вызова функции.
  const typingText = computed(() => {
    const u = typingUsers.value
    if (!u.length) return ''
    if (u.length === 1) return `${u[0]} печатает...`
    return `${u.slice(0, -1).join(', ')} и ${u.at(-1)} печатают...`
  })

  // Очищаем таймер когда компонент размонтируется —
  // иначе setTimeout сработает на уже удалённый компонент.
  onUnmounted(() => clearTimeout(stopTimer))

  return { typingText, onInput }
}
