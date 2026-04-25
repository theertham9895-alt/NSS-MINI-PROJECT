const jwt = require('jsonwebtoken');

let ioInstance = null;
const userSockets = new Map();

const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = payload;
    return next();
  } catch {
    return next(new Error('Unauthorized'));
  }
};

const registerSocketHandlers = (io) => {
  io.use(socketAuth);

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket.id);

    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId);
      if (!sockets) return;
      sockets.delete(socket.id);
      if (sockets.size === 0) userSockets.delete(userId);
    });
  });
};

const setIO = (io) => {
  ioInstance = io;
  registerSocketHandlers(ioInstance);
};

const emitToUser = (userId, event, payload) => {
  if (!ioInstance) return;
  const sockets = userSockets.get(String(userId));
  if (!sockets) return;
  sockets.forEach((socketId) => {
    ioInstance.to(socketId).emit(event, payload);
  });
};

module.exports = { setIO, emitToUser };
