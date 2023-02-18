const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.port || 3000

server.listen(port, () => {
  console.log('listening on port %d', port);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('stateUpdate', function(player) {
    console.log('got state update', player)
    io.sockets.emit('stateUpdateForwardedByServer', player)
  })
});

