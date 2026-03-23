<script setup>
import { ref, inject } from 'vue'

const { rooms, currentRoom, joinRoom, createRoom } = inject('chat')
const { unread, clearUnread } = inject('unread')

function handleJoin(room) {
  joinRoom(room)
  clearUnread(room)
}

const newRoomName = ref('')
const showInput = ref(false)

function handleCreate() {
  const name = newRoomName.value.trim()
  if (!name) return
  createRoom(name)
  newRoomName.value = ''
  showInput.value = false
}
</script>

<template>
  <aside class="sidebar">
    <h2>Каналы</h2>

    <!-- v-for рендерит элемент для каждой комнаты в массиве.
         :key — обязательный атрибут, помогает Vue эффективно обновлять список.
         :class — динамический класс: добавляет 'active' если это текущая комната. -->
    <ul>
      <li
        v-for="room in rooms"
        :key="room"
        :class="{ active: room === currentRoom }"
        @click="handleJoin(room)"
      >
        # {{ room }}
        <span v-if="unread[room]" class="badge">{{ unread[room] }}</span>
      </li>
    </ul>

    <!-- Форма создания комнаты -->
    <div class="create">
      <button @click="showInput = !showInput">+ Новый канал</button>
      <div v-if="showInput" class="create-input">
        <input
          v-focus
          v-model="newRoomName"
          placeholder="Название канала"
          @keyup.enter="handleCreate"
          @keyup.esc="showInput = false"
        />
        <button @click="handleCreate">ОК</button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 200px;
  background: #1e1e2e;
  color: #cdd6f4;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 8px;
}

h2 {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #6c7086;
  margin: 0 0 8px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

li {
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

li:hover { background: #313244; }
li.active { background: #45475a; color: #cba6f7; }

.create {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.create-input {
  display: flex;
  gap: 4px;
}

.create-input input {
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #45475a;
  background: #313244;
  color: #cdd6f4;
  font-size: 13px;
}

button {
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  background: #313244;
  color: #cdd6f4;
  cursor: pointer;
  font-size: 13px;
}

button:hover { background: #45475a; }

.badge {
  margin-left: auto;
  background: #cba6f7;
  color: #1e1e2e;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
}

li {
  display: flex;
  align-items: center;
}
</style>
