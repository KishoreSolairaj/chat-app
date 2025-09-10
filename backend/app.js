const express = require('express');
const app = express();
const http = require('http');
// const path = require('path');
const socketIo = require('socket.io');
var cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const multiparty = require('multiparty');


const fs = require('fs');
const path = require('path');
const os = require('os');

const corsOptions = {
  origin: 'http://localhost:8100',
  credentials: true,            // access-control-allow-credentials:true
  optionSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3005;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Create an HTTP server from the Express app
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8100",
    methods: ["GET", "POST"],
    credentials: true
  }
});

//socket datas
let SocketsConnected = [];
let Users = [];
io.on('connection', (socket) => {



  //set size and id
  socket.on('get-client-total',(data)=>{
    io.emit('client-total',SocketsConnected)
    io.to(socket.id).emit('client-id',socket.id)
  })

  //set user
  socket.on('set-users',(data)=>{
    if(data.sender_id != ''&& data.name != '' && data.sender_id != null && data.name != null && data.sender_id != undefined && data.name != undefined){
      if(Users.length == 0){
        SocketsConnected.push(socket.id);
        io.emit('client-total',SocketsConnected);
        let userFormGroup = {
          name: data.name,
          receiver_id: data.sender_id,
          message: [],
          unreadMessageCount:0
        }
        Users.push(userFormGroup);
        io.emit('get-complete-users', Users)
        io.emit('get-users', userFormGroup)
      }else{
        if (!SocketsConnected.includes(socket.id)) {
          SocketsConnected.push(socket.id);
          io.emit('client-total',SocketsConnected);
          let userFormGroup = {
            name: data.name,
            receiver_id: data.sender_id,
            message: [],
            unreadMessageCount:0
          }
          Users.push(userFormGroup);
          io.emit('get-complete-users', Users)
          io.emit('get-users', userFormGroup)
        }
      }
      
    }
    
  })


  // Handle personal chat message
  socket.on('send-personal-message', (data) => {
    console.log(data, "personal message")
    const targetSocketId = data.receiver_id;
    if (targetSocketId) {
      io.to(targetSocketId).emit('receive-personal-message', data);
      io.to(socket.id).emit('sended-personal-message', data);
    }
  });

  // Handle personal chat message
  socket.on('send-group-message', (data) => {
    console.log(data, "group message")
      io.emit('receive-group-message', data);
  });

  //ondisconnect
  socket.on('disconnect', () => {
    const index = SocketsConnected.indexOf(socket.id);
    if (index !== -1) {
      SocketsConnected.splice(index, 1);
      io.emit('client-total',SocketsConnected)
      const userExists = Users.find(user => user.receiver_id === socket.id);
      const newArray = Users.filter(item => item.receiver_id !== socket.id);
      Users = newArray
      io.emit('client-disconnected',userExists)
    }
    if(SocketsConnected.length == 0){
      SocketsConnected = [];
      Users = [];
    }

  })


  
  
});



// Start the server
server.listen(PORT, () => {
  console.log(`App running on port number: ${PORT}`);
});

// Copy the request listeners
const listeners = server.listeners('request').slice(0);
console.log('Copied Listeners:', listeners);

module.exports = server;