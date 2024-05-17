const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const rooms = []; // Oda bilgilerini saklamak için dizi

io.on('connection', (socket) => {
  console.log('Yeni bir kullanıcı bağlandı!');

  socket.on('createRoom', ({ roomNumber }) => {
    const existingRoom = rooms.find((room) => room.roomNumber === roomNumber);
    if (!existingRoom) {
      const newRoom = { roomNumber, players: [{ id: socket.id, email: '' }] };
      rooms.push(newRoom);
      socket.join(roomNumber.toString()); // Odaya katıl
      socket.emit('waiting'); // Bekleme durumunu bildir
    } else {
      const playerCount = existingRoom.players.length;
      if (playerCount < 2) {
        existingRoom.players.push({ id: socket.id, email: '' });
        socket.join(roomNumber.toString()); // Odaya katıl
        const otherPlayer = existingRoom.players.find((player) => player.id !== socket.id);
        io.to(otherPlayer.id).emit('matchFound', { roomNumber }); // Eşleşme sağlandı, diğer oyuncuya bildir
        socket.emit('matchFound', { roomNumber }); // Eşleşme sağlandı, bu oyuncuya bildir
      } else {
        // Oda dolu, başka bir oda numarası deneyin veya bir hata bildirin
        socket.emit('roomFull');
      }
    }
  });

  socket.on('disconnect', () => {
    const roomIndex = rooms.findIndex((room) => room.players.some((player) => player.id === socket.id));
    if (roomIndex !== -1) {
      const room = rooms[roomIndex];
      const playerIndex = room.players.findIndex((player) => player.id === socket.id);
      const userEmail = room.players[playerIndex].email;
      room.players.splice(playerIndex, 1);
      if (room.players.length === 0) {
        rooms.splice(roomIndex, 1); // Oyuncu yoksa odayı sil
      } else if (room.players.length === 1) {
        // Oda doluyken bir oyuncu ayrılırsa, diğer oyuncuya bilgi ver
        io.to(room.players[0].id).emit('opponentLeft');
      }
      console.log(`${userEmail} kullanıcısı ayrıldı.`);
    }

    console.log('Bir kullanıcı ayrıldı.');
  });
});

server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
