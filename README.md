# VueChat

Real-time multi-room messenger built as a Vue 3 learning project.

Two browser windows connect via WebSocket and chat across channels in real time.

## Stack

- **Client** — Vue 3 + Vite + TypeScript
- **Server** — Node.js + WebSocket (`ws`)

## Vue 3 features covered

- Composition API + `<script setup>`
- `ref`, `shallowRef`, `reactive`, `shallowReactive`, `computed`
- `watch`, `watchEffect`, `nextTick`
- `provide` / `inject`
- `onUnmounted` lifecycle cleanup
- `TransitionGroup` — animated message list and toasts
- `Teleport` — toast notifications rendered in `<body>`
- Custom directive `v-focus`
- Composables: `useWebSocket`, `useChat`, `useTyping`, `useNotifications`

## Running locally

**Server** (port 8080):
```bash
cd server && npm install && node index.js
```

**Client** (port 5173):
```bash
npm install && npm run dev
```

Open two browser windows at `http://localhost:5173`, enter different names, pick a room and start chatting.

## WebSocket protocol

| Direction | Message |
|-----------|---------|
| → server | `{ type: 'auth', username }` |
| → server | `{ type: 'join', room }` |
| → server | `{ type: 'message', text, id }` |
| → server | `{ type: 'react', messageId, emoji }` |
| → server | `{ type: 'typing', isTyping }` |
| → server | `{ type: 'create', room }` |
| ← client | `{ type: 'auth_ok', rooms }` |
| ← client | `{ type: 'history', messages }` |
| ← client | `{ type: 'message', from, text, id, timestamp }` |
| ← client | `{ type: 'notify', ... }` — unread badge for other rooms |
| ← client | `{ type: 'react', messageId, emoji, from }` |
| ← client | `{ type: 'typing', from, isTyping }` |
| ← client | `{ type: 'users', list }` |
| ← client | `{ type: 'room_created', room }` |
