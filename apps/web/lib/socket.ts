import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5278/api';
// A porta do Socket.IO geralmente é a raiz (sem /api) dependendo da configuração do backend
const SOCKET_URL = API_URL.replace('/api', '');

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  if (socket) {
    // Atualiza o auth se o socket já existir
    socket.auth = { token };
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected');
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected');
  });

  socket.on('error', (err) => {
    console.error('[Socket] Error:', err);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
