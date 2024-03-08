const express = require('express');
// const { Socket } = require('socket.io');
const app = express();

const server = require('http').Server(app);
const { ExpressPeerServer } = require("peer");
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');

const peerServer = ExpressPeerServer(server, {
	debug: true,
});

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/peerjs',peerServer);

const PORT = process.env.PORT || 3000; 

app.get('/',(req,res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get('/:room',(req,res) => {
  res.render('room',{roomId : req.params.room});
});


io.on('connection',(socket) =>{
  socket.on('join-room',(roomId,userId) =>{
    socket.join(roomId);
    socket.to(roomId).emit('user-connected',userId);

    socket.on('message' ,(message) =>{
      io.to(roomId).emit('createMessage' , message);
      
    })

    socket.on('disconnect',() =>{
        socket.to(roomId).emit('user-disconnected', userId);
      }) 
    
  })
})
 
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});