<script setup>
import { ref, inject, watch, nextTick } from 'vue'
import MessageItem from './MessageItem.vue'

const { messages, react } = inject('chat')

// ref на DOM-элемент — как useRef в React.
// Vue автоматически присвоит ему элемент когда шаблон смонтируется.
const listEl = ref(null)

function scrollToBottom() {
  if (listEl.value) {
    listEl.value.scrollTop = listEl.value.scrollHeight
  }
}

// watch следит за массивом messages.
// Когда приходит новое сообщение — скроллим вниз.
// Но! DOM обновляется асинхронно после изменения данных.
// nextTick — ждём следующего "тика" рендера, только потом скроллим.
// Иначе scrollHeight ещё не учитывает новое сообщение.
watch(messages, () => {
  nextTick(scrollToBottom)
}, { deep: true })
</script>

<template>
  <div class="list" ref="listEl">
    <!-- TransitionGroup анимирует добавление/удаление элементов списка.
         name="message" — Vue будет искать CSS-классы .message-enter-active и т.д.
         tag="div" — TransitionGroup рендерится как <div> в DOM. -->
    <TransitionGroup name="message" tag="div" class="messages">
      <MessageItem
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
        @react="(emoji) => react(msg.id, emoji)"
      />
    </TransitionGroup>

    <p v-if="!messages.length" class="empty">
      Нет сообщений. Напиши первым!
    </p>
  </div>
</template>

<style scoped>
.list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 8px;
}

.empty {
  color: #6c7086;
  text-align: center;
  margin-top: 40px;
  font-size: 14px;
}

/* TransitionGroup CSS-классы:
   -enter-from  — начальное состояние (элемент только появился)
   -enter-active — анимация входа
   -enter-to    — конечное состояние */
.message-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.message-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.message-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
