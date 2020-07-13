import axios from "./axios";

var receiveFriendsWannaBe = function () {
    return axios
        .get("/friends.json")
        .then(({ data }) => {
            return {
                type: "RECEIVE_FRIENDS_WANNABES",
                friendsWannabes: data
            };
        });
};

var acceptFriendRequest = function (otherId) {
    return axios.post(`/acceptFriendRequest/${otherId}`)
        .then(({ data }) => {
            if (data.accepted) {
                return {
                    type: "ACCEPT_FRIEND_REQUEST",
                    otherId
                };
            }
        })
        .catch(error => {
            console.error(error);
        });
};

var declineFriendRequest = function (otherId) {
    return axios.post(`/declineFriendRequest/${otherId}`)
        .then(({ data }) => {
            if (data.accepted) {
                return {
                    type: "DECLINE_FRIEND_REQUEST",
                    otherId
                };
            }
        })
        .catch(error => {
            console.error(error);
        });
};

var deleteFriendRequest = function (otherId) {
    return axios.post(`/deleteFriendRequest/${otherId}`)
        .then(({ data }) => {
            if (data.accepted) {
                return {
                    type: "DELETE_FRIEND_REQUEST",
                    otherId
                };
            }
        })
        .catch(error => {
            console.error(error);
        });
};

var chatMessages = function (tenMsgs) {
    return {
        type: "TEN_MESSAGES",
        tenMsgs
    };
};

var chatMessage = function (msg) {
    return {
        type: "LAST_MESSAGE",
        msg
    };
};

var newUserJoined = function (newUser) {
    return {
        type: "NEW_USER",
        newUser
    };
};

var onlineUsers = function (otherUserOnline) {
    return {
        type: "ONLINE",
        otherUserOnline
    };

};

var privateMessage = function (Pmsg) {
    return {
        type: "PRIVATEMESSAGE",
        Pmsg
    };
};

export {
    receiveFriendsWannaBe,
    acceptFriendRequest,
    declineFriendRequest,
    deleteFriendRequest,
    chatMessages,
    chatMessage,
    newUserJoined,
    onlineUsers,
    privateMessage };
