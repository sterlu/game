// TODO : socket logic should go here

// import socketIOClient from 'socket.io-client';
const socket = openSocket("http://localhost:6600");

socket.on('state', (msg) => {
    console.log(msg);
    }
  );

socket.on('rolled', (msg) =>{
    console.log(msg.player.name);
    console.log(msg.rolled);
});