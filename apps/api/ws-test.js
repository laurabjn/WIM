import { io } from 'socket.io-client';

const socket = io('http://localhost:3002/ws', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('connected:', socket.id);
  socket.emit('ping', { hello: 'world' });
});

socket.on('pong', (data) => {
  console.log('pong:', data);
  socket.disconnect();
});

socket.on('connect_error', (err) => {
  console.error('connect_error:', err.message);
});
