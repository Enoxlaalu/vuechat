<script setup>
import { inject } from 'vue'

const { onlineUsers } = inject('chat')
</script>

<template>
  <aside class="userlist">
    <h2>Онлайн — {{ onlineUsers.length }}</h2>
    <ul>
      <li v-for="user in onlineUsers" :key="user">
        <span class="dot">●</span> {{ user }}
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.userlist {
  width: 160px;
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 16px;
  border-left: 1px solid #313244;
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
  gap: 6px;
}

li {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  color: #a6e3a1;
  font-size: 10px;
}
</style>
