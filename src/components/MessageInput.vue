<script setup>
import { ref, inject } from 'vue'
import { useTyping } from '../composables/useTyping'

const { sendMessage, currentRoom } = inject('chat')
const { on, send } = inject('ws')

const { typingText, onInput } = useTyping({ on, send })

const text = ref('')

function handleSend() {
  if (!text.value.trim() || !currentRoom.value) return
  sendMessage(text.value.trim())
  text.value = ''
}

// Ctrl+Enter или просто Enter отправляет сообщение.
// Shift+Enter — перенос строки (браузерное поведение по умолчанию, не мешаем).
function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="input-area">
    <!-- typing indicator — показывается только когда typingText не пустой -->
    <p v-if="typingText" class="typing">{{ typingText }}</p>

    <div class="row">
      <textarea
        v-focus
        v-model="text"
        :placeholder="currentRoom ? `Сообщение в #${currentRoom}` : 'Выбери канал...'"
        :disabled="!currentRoom"
        rows="1"
        @keydown="handleKeydown"
        @input="onInput"
      />
      <button :disabled="!text.trim() || !currentRoom" @click="handleSend">
        Отправить
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-area {
  padding: 8px 16px 16px;
  border-top: 1px solid #313244;
}

.typing {
  font-size: 12px;
  color: #6c7086;
  margin: 0 0 6px;
  height: 16px;
}

.row {
  display: flex;
  gap: 8px;
}

textarea {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #45475a;
  background: #313244;
  color: #cdd6f4;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  line-height: 1.5;
}

textarea:focus {
  outline: none;
  border-color: #cba6f7;
}

textarea:disabled {
  opacity: 0.5;
}

button {
  padding: 0 20px;
  border-radius: 8px;
  border: none;
  background: #cba6f7;
  color: #1e1e2e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-end;
  height: 40px;
}

button:disabled {
  opacity: 0.4;
  cursor: default;
}

button:not(:disabled):hover {
  background: #d0b4f7;
}
</style>
