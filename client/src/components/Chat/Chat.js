import React, { useState, useEffect } from 'react';
import queryString from 'query-string'; // use to retrieve data from url
import io from 'socket.io-client';
import './Chat.css';
import TextContainer from '../TextContainer/TextContainer';

import Messages from '../Messages/Messages';

import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
let socket;

const Chat = ({ location}) => { // location comes from router.js

    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [users, setUsers] = useState('');
    const [message, setMessage] = useState(''); // single message store
    const [messages, setMessages] = useState([]);

    const ENDPOINT = 'localhost:5000'; // to make server connection

    useEffect(() => {
        const { name, room } = queryString.parse(location.search); // used to get name and room from join page
        //console.log(location.search);
        //console.log(data);
        //console.log(name, room);
        socket = io(ENDPOINT);

        setName(name);
        setRoom(room);
        // console.log(socket);
        socket.emit('join', { name, room }, () => {
               // alert(error);
        }); // to send msg to server

        return () => { // to unmount
            socket.emit('disconnect');
            socket.off();
        }

    }, [ENDPOINT, location.search]);

    //handling message
    useEffect(() => {
        socket.on('message', (message) => {
            setMessages([...messages, message]) // add messages
        });
        socket.on("roomData", ({ users }) => {
            setUsers(users);
        });
    }, [messages]);

    const sendMessage = (event) => {
        event.preventDefault();

        if (message) {
            socket.emit('sendMessage', message, () => setMessage(''));
        }
    }

    console.log(message, messages);

    //function for sending messages
    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name={name} />
                <Input message={message} sendMessage={sendMessage} setMessage={setMessage} />
            </div>
            <TextContainer users={users} />
        </div>
    )
};

export default Chat;