<script setup>
defineProps({
  toasts: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <!-- Teleport рендерит содержимое прямо в <body>, вне иерархии компонентов.
       Это важно для тостов — они должны быть поверх всего,
       и не наследовать overflow:hidden или z-index от родителей. -->
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast">
        {{ t.text }}
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.toast {
  background: #313244;
  color: #cdd6f4;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  max-width: 320px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border-left: 3px solid #cba6f7;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.toast-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.toast-leave-from {
  opacity: 1;
}

.toast-leave-active {
  transition: opacity 0.2s ease;
}

.toast-leave-to {
  opacity: 0;
}
</style>
