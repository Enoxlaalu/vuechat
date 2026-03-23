<script setup>
// defineProps — объявляем что компонент принимает снаружи.
// defineEmits — объявляем какие события компонент может генерировать наверх.
// Обе функции доступны в <script setup> без импорта.
const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['react'])

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢']

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="message">
    <div class="meta">
      <span class="from">{{ message.from }}</span>
      <span class="time">{{ formatTime(message.timestamp) }}</span>
    </div>

    <p class="text">{{ message.text }}</p>

    <!-- Реакции: кнопки emoji + счётчики уже поставленных -->
    <div class="reactions">
      <button
        v-for="emoji in EMOJIS"
        :key="emoji"
        class="emoji-btn"
        @click="emit('react', emoji)"
      >
        {{ emoji }}
        <!-- Показываем счётчик только если реакция уже есть -->
        <span v-if="message.reactions?.[emoji]" class="count">
          {{ message.reactions[emoji] }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.message {
  padding: 8px 16px;
  border-radius: 8px;
}

.message:hover {
  background: #313244;
}

.meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

.from {
  font-weight: 600;
  color: #cba6f7;
  font-size: 14px;
}

.time {
  font-size: 11px;
  color: #6c7086;
}

.text {
  margin: 0;
  color: #cdd6f4;
  font-size: 14px;
  line-height: 1.5;
}

.reactions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.message:hover .reactions {
  opacity: 1;
}

.emoji-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #45475a;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #cdd6f4;
}

.emoji-btn:hover {
  background: #45475a;
}

.count {
  font-size: 12px;
  color: #a6adc8;
}
</style>
