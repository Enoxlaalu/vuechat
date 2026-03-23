<script setup>
import { ref, provide, watch } from 'vue'
import { useWebSocket } from './composables/useWebSocket'
import { useChat } from './composables/useChat'
import { useNotifications } from './composables/useNotifications'
import Sidebar from './components/Sidebar.vue'
import UserList from './components/UserList.vue'
import MessageList from './components/MessageList.vue'
import MessageInput from './components/MessageInput.vue'
import Toast from './components/Toast.vue'

const { connected, connect, on, send } = useWebSocket('ws://localhost:8080')
provide('ws', { connected, on, send })

const chat = useChat({ on, send })
provide('chat', chat)

const { unread, toasts, clearUnread, dismissToast } = useNotifications({ on })

// clearUnread пробрасываем в chat через provide чтобы Sidebar мог вызвать его при смене комнаты
provide('unread', { unread, clearUnread })

// --- Состояние входа ---
const username = ref('')
const loggedIn = ref(false)

on('auth_ok', ({ rooms }) => {
  chat.rooms.value = rooms
  loggedIn.value = true
})

function login() {
  if (!username.value.trim()) return
  connect()
}

watch(connected, (isConnected) => {
  if (isConnected) {
    send({ type: 'auth', username: username.value.trim() })
  }
})
</script>

<template>
  <div v-if="!loggedIn" class="login">
    <h1>VueChat</h1>
    <input
      v-focus
      v-model="username"
      placeholder="Введи имя..."
      @keyup.enter="login"
    />
    <button :disabled="!username.trim()" @click="login">Войти</button>
  </div>

  <div v-else class="layout">
    <div v-if="!connected" class="reconnecting">Переподключение...</div>
    <Sidebar />
    <main class="main">
      <MessageList />
      <MessageInput />
    </main>
    <UserList />
  </div>

  <!-- Toast рендерится через Teleport в <body>, вне layout -->
  <Toast :toasts="toasts" @dismiss="dismissToast" />
</template>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 12px;
  background: #181825;
  color: #cdd6f4;
}

.login h1 {
  font-size: 32px;
  margin: 0 0 8px;
  color: #cba6f7;
}

.login input {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #45475a;
  background: #313244;
  color: #cdd6f4;
  font-size: 16px;
  width: 260px;
}

.login input:focus {
  outline: none;
  border-color: #cba6f7;
}

.login button {
  padding: 10px 32px;
  border-radius: 8px;
  border: none;
  background: #cba6f7;
  color: #1e1e2e;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.login button:disabled {
  opacity: 0.4;
  cursor: default;
}

.layout {
  display: flex;
  height: 100vh;
  background: #181825;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.reconnecting {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: #f38ba8;
  color: #1e1e2e;
  text-align: center;
  padding: 6px;
  font-size: 13px;
  font-weight: 600;
  z-index: 100;
}
</style>
