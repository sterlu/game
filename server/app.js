const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const io = require('socket.io');

const createGame = require('./src/game');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/build/')));
app.get('*', (req, res) => res.redirect('/'));

const port = 6600;
const server = http.createServer(app);
server.listen(port, () => console.log(`App listening on port ${port}`));

const game = createGame();

const socketServer = io(server);
socketServer.on('connection', function (socket) {
  socket.on('disconnect', function () {
    game.removePlayer(socket.id);
  });
  socket.on('register', function (name) {
    game.addPlayer(socket.id, name, socket);
  });
  socket.on('game start', function (msg) {
    game.start();
  });
  socket.on('game turn', function (msg) {
    game.turn();
  });
});
