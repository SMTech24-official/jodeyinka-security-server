import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

export const setIOInstance = (ioInstance: SocketIOServer) => {
  io = ioInstance;
};

export const getIOInstance = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io instance not initialized');
  }
  return io;
};