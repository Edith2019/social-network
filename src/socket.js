import * as io from 'socket.io-client';
import { chatMessages, chatMessage, newUserJoined, onlineUsers, privateMessage } from './actions';

export let socket;

export const init = store => {
    if (!socket) {
        socket = io.connect();

        socket.on('chatMessages', tenMsgs => {
            store.dispatch(
                chatMessages(tenMsgs));
        });

        socket.on('chatMessage', msg => {
            store.dispatch(
                chatMessage(msg));
        });

        socket.on('newUserJoined', newUser => {
            // console.log("new user in socker", newUser);
            store.dispatch(
                newUserJoined(newUser));
        });

        socket.on('onlineusers', otherUserOnline => {
            // console.log("online users", otherUserOnline);
            store.dispatch(
                onlineUsers(otherUserOnline));
        });

        socket.on('chatPrivateMessage', Pmsg => {
            // console.log("something in socket private", Pmsg);
            store.dispatch(
                privateMessage(Pmsg));
        });

    }
};
//will use dispatch in socket