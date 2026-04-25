import { io } from 'socket.io-client';

let socket = null;
const HOST = window.location.hostname || 'localhost';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || `http://${HOST}:5000`;

export const connectSocket = (token) => {
  if (!token) return null;
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling']
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
