const express = require('express');
const app = express();
var cors = require('cors')
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

app.use(cors())

const io = new Server(server, {
  cors: {
    origin: "https://fbclone-henryj4152.vercel.app",
    methods: ["GET", "POST"]
  }
});



app.get('/', (req, res) => {
  res.send('<h1>socket io server up and running</h1>');
});

//tracks users in server so we can find their socketId with their userId(from client) to know which client to send msgs to
let users = []

io.on('connection', (socket) => {
  console.log('a user connected');

  // add userId and socketId to server
  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users)
  });


  socket.on('sendMessage', ({ senderId, receiverId, text }) => {

    const receiver = getUser(receiverId)
    receiver && io.to(receiver.socketId).emit("getMessage", { senderId, text })
  });




  socket.on('disconnect', () => {
    console.log('user disconnected');
    removeUser(socket.id)
    io.emit("getUsers", users)

  });

});


server.listen(5000, () => {
  console.log('listening on :5000');
});




function addUser(userId, socketId) {
  const found = users.some(item => item.userId === userId);
  if (!found) {
    users.push({ userId, socketId });
  }
}
function removeUser(socketId) {
  users = users.filter(item => item.socketId != socketId);
}
function getUser(userId) {
  return users.find(item => item.userId === userId)
}
