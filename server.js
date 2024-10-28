const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');
// const ACTIONS = require('./src/Actions');

const server = http.createServer(app);
const io = new Server(server);


app.use(express.static('build'));

app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


const userSocketMap = {};
function getAllConnectedClients(roomId){
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId)=>{
        return{
            socketId,
            username: userSocketMap[socketId]
        }
    });
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
   
    // creating a socket map using this dictionary 
    // data structure  
    socket.on(ACTIONS.JOIN,({roomId,username})=>{
        userSocketMap[socket.id] = username; 
        socket.join(roomId);
        // using this we can get all the clients
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId})=>{
            io.to(socketId).emit(ACTIONS.JOINED,{
                clients,
                username,
                socketId: socket.id,
            })
        });
    
    });

    socket.on(ACTIONS.CODE_CHANGE,({roomId,code})=>{
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE,{code});
    })

  
    // // sending to the clients now catching on their side
    socket.on(ACTIONS.SYNC_CODE,({socketId,code})=>{
        io.to(socketId).emit(ACTIONS.CODE_CHANGE,{code});
    })
  
    // making the socket as disconnected 
    socket.on('disconnecting',()=>{
        // creating  a room
        const rooms = [...socket.rooms];
        
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED,
            {
                socketId : socket.id,
                username : userSocketMap[socket.id]
            });
        
        });
        // deleting that socket from the room 
        delete userSocketMap[socket.id];
        socket.leave();
    })
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on the port ${PORT}`));