import axios from "./axios";

export function receiveFriendsWannaBe() {
    return axios
        .get("/friends.json")
        .then(({ data }) => {
            return {
                type: "RECEIVE_FRIENDS_WANNABES",
                friendsWannabes: data
            };
        });
}

export function acceptFriendRequest(otherId) {
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
}

export function declineFriendRequest(otherId) {
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
}

export function deleteFriendRequest(otherId) {
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
}

export function chatMessages(tenMsgs) {
    return {
        type: "TEN_MESSAGES",
        tenMsgs
    };
}

export function chatMessage(msg) {
    return {
        type: "LAST_MESSAGE",
        msg
    };
}

export function newUserJoined(newUser) {
    return {
        type: "NEW_USER",
        newUser
    };
}

export function onlineUsers(otherUserOnline) {
    return {
        type: "ONLINE",
        otherUserOnline
    };

}

export function privateMessage(Pmsg) {
    return {
        type: "PRIVATEMESSAGE",
        Pmsg
    };
}