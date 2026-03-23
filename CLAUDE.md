# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
# Client
npm run dev          # start dev server with HMR (port 5173)
npm run build        # type-check + build for production
npm run build-only   # build without type-check
npm run type-check   # run vue-tsc type checking
npm run lint         # run oxlint then eslint (both with --fix)
npm run format       # format src/ with prettier
npm run preview      # preview production build

# Server
cd server && node index.js   # start WebSocket server (port 8080)
```

Linting runs oxlint first, then eslint coordinated via `eslint-plugin-oxlint` so rules don't overlap.

## Architecture

Real-time multi-room chat. Client (Vue 3 + Vite) connects to a Node.js WebSocket server.

### Data flow

```
Browser A                   server/index.js               Browser B
  send({ type: 'message' }) → ws.onmessage → broadcast() → ws.onmessage
                                           → notify (clients in other rooms)
```

Server holds all state in memory (`rooms: Map`, `clients: Map`). Restart clears history.

### Client

**`src/App.vue`** — root component. Creates `useWebSocket`, calls `useChat` and `useNotifications`, then exposes them to the whole tree via:
- `provide('ws', { connected, on, send })`
- `provide('chat', { rooms, currentRoom, messages, onlineUsers, joinRoom, sendMessage, react, createRoom })`
- `provide('unread', { unread, clearUnread })`

All child components get ws/chat via `inject()` instead of props.

**Composables** (`src/composables/`):
- `useWebSocket(url)` — manages the WebSocket connection, auto-reconnects after 3s. Exposes `on(type, fn)` event registry and `send(msg)`.
- `useChat({ on, send })` — rooms, messages, join/send/react logic. Caches room histories in `shallowReactive({})`.
- `useTyping({ on, send })` — debounced typing indicator. Cleans up timer in `onUnmounted`.
- `useNotifications({ on })` — listens to `notify` events for unread badges and toasts.

**Key constraint**: `provide` and `inject` don't work within the same component. Composables that need `on`/`send` receive them as arguments rather than calling `inject('ws')`.

### WebSocket message types

Server sends `notify` (not `message`) to clients in *other* rooms — this is what drives unread badges. `message` goes only to members of the sender's room.

### Path alias

`@` maps to `src/` (configured in `vite.config.ts`).

### TypeScript

Split tsconfig — `tsconfig.app.json` for src, `tsconfig.node.json` for Vite config. Use `vue-tsc` (not `tsc`) for type checking. Composables are `.js` files — TS hints about missing declarations are expected and harmless.
