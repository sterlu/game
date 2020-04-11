const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const https = require('https');
const io = require('socket.io');

const createGame = require('./src/game');

const isProd = process.env.NODE_ENV === 'production';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/build/')));
app.get('*', (req, res) => res.redirect('/'));

app.use((req, res, next) => {
  (isProd && !req.secure)
    ? res.redirect('https://' + req.headers.host + req.url)
    : next();
});

const httpServer = http.createServer(app);
httpServer.listen(80);

const key = isProd
  ? fs.readFileSync('/etc/letsencrypt/live/greenpeaks.online/privkey.pem', 'utf8')
  : fs.readFileSync(path.resolve('./ssl/localhost.key'), 'utf8');
const cert = isProd
  ? fs.readFileSync('/etc/letsencrypt/live/greenpeaks.online/cert.pem', 'utf8')
  : fs.readFileSync(path.resolve('./ssl/localhost.crt'), 'utf8');
const ca = isProd
  ? fs.readFileSync('/etc/letsencrypt/live/greenpeaks.online/chain.pem', 'utf8')
  : undefined;

const httpsServer = https.createServer({ key, cert, ca }, app);
httpsServer.listen(443);

const game = createGame();

const socketServer = io(httpsServer);
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
  socket.on('kick', function () {
    game.kick();
  });

});
