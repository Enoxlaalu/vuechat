import { ref, shallowRef, onUnmounted } from 'vue'

export function useWebSocket(url) {
  // shallowRef — потому что нам не нужна глубокая реактивность внутри объекта WebSocket.
  // Vue не должен отслеживать его свойства — нам важен только сам факт замены ws.value.
  const ws = shallowRef(null)
  const connected = ref(false)
  let closing = false

  // Реестр обработчиков: { 'message': [fn1, fn2], 'typing': [fn3], ... }
  // Обычный объект, не реактивный — нам не нужно отслеживать его изменения.
  const handlers = {}

  function connect() {
    ws.value = new WebSocket(url)

    ws.value.onopen = () => {
      connected.value = true
    }

    ws.value.onclose = () => {
      connected.value = false
      // Автореконнект: через 3 секунды пробуем подключиться снова.
      // closing=true означает намеренное закрытие (onUnmounted) — реконнект не нужен.
      if (!closing) setTimeout(connect, 3000)
    }

    ws.value.onmessage = (event) => {
      let msg
      try {
        msg = JSON.parse(event.data)
      } catch {
        return
      }
      // Вызываем все обработчики, зарегистрированные для данного типа сообщения.
      handlers[msg.type]?.forEach(fn => fn(msg))
    }
  }

  // Подписаться на сообщения определённого типа.
  // Можно вызвать несколько раз с одним type — все колбэки сработают.
  function on(type, fn) {
    ;(handlers[type] ??= []).push(fn)
  }

  // Отправить сообщение на сервер.
  // ?. — если соединение ещё не установлено, просто ничего не делаем.
  function send(msg) {
    ws.value?.send(JSON.stringify(msg))
  }

  // Lifecycle cleanup: когда компонент, который вызвал useWebSocket, размонтируется —
  // закрываем соединение, чтобы не оставлять висящих коннектов.
  onUnmounted(() => { closing = true; ws.value?.close() })

  return { connected, connect, on, send }
}
