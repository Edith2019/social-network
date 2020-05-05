import axios from './axios';

export async function receiveFriendsWannaBe() {
    console.log("receive wanna be");
    const { data } = await axios.get('/friends.json');
    return {
        type: 'RECEIVE_FRIENDS_WANNABES',
        friendsWannabes: data,
    };
}

export async function acceptFriendRequest(otherId) {
    const { data } = await axios.post(`/acceptFriendRequest/${otherId}`);
    console.log("data accept friend request", data);
    return {
        type: 'ACCEPT_FRIEND_REQUEST',
        otherId
    };
}

export async function declineFriendRequest(otherId) {
    const { data } = await axios.post(`/declineFriendRequest/${otherId}`);
    console.log("data accept friend request", data);
    return {
        type: 'DECLINE_FRIEND_REQUEST',
        otherId
    };
}

export async function deleteFriendRequest(otherId) {
    const { data } = await axios.post(`/deleteFriendRequest/${otherId}`);
    // console.log("data accept friend reques deletet", data);
    return {
        type: 'DELETE_FRIEND_REQUEST',
        otherId
    };
}

export async function chatMessages(tenMsgs) {
    // console.log("ten msgs in actions", tenMsgs);
    return {
        type: 'TEN_MESSAGES',
        tenMsgs
    };
}


export async function chatMessage(msg) {
    // console.log("msg in action", msg);
    return {
        type: 'LAST_MESSAGE',
        msg
    };
}

export async function newUserJoined(newUser) {
    // console.log("new User in action", newUser);
    return {
        type: 'NEW_USER',
        newUser
    };
}

export async function onlineUsers(otherUserOnline) {
    // console.log("something in usersonline");
    return {
        type: 'ONLINE',
        otherUserOnline
    };

}

export async function privateMessage(Pmsg) {
    // console.log("fin action actions", Pmsg);
    return {
        type: 'PRIVATEMESSAGE',
        Pmsg
    };
}