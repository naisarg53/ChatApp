const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js'); 

const PORT = process.env.PORT || 5000;

const router = require('./router'); // use exported rounter from router.js

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {   // from socket.io documentation
    //console.log('a user connected');

    socket.on('join', ({ name, room }, callback) => { // get name and room from chat.js by socket.emit

        const { error, user } = addUser({ id: socket.id, name, room }); // addUser return error and user
        if (error) return callback(error);

        socket.join(user.room); // join all user

        socket.emit('message', { user: 'admin', text: `${user.name}, Welcome to the room ${user.room}` }); // welcome msg when to every one 
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined` }); 

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });


        callback();
        /*console.log(name, room);
        
        const error = true;

        if (error) {
            callback({ error: 'error' }); // send ereor msg to chat.js
        }*/
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', { user: user.name, text: message });

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left.` });
        }
        console.log('user disconnected');
    });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));