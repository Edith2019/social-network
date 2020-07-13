// if reducer ispassed the state good if not, will create one

export default function reducer(state = {}, action) {
    if (action.type === "RECEIVE_FRIENDS_WANNABES") {
        state = {
            ...state,
            friendsWannabes: action.friendsWannabes
        };
    }

    if (action.type === "ACCEPT_FRIEND_REQUEST") {
        state = {
            ...state,
            friendsWannabes: state.friendsWannabes.map(friendsWannabe => {
                if (action.otherId === friendsWannabe.id) {
                    friendsWannabe.accepted = true;
                    return friendsWannabe;
                } else {
                    return friendsWannabe;
                }
            })
        };
    }

    if (action.type === "DECLINE_FRIEND_REQUEST") {
        state = {
            ...state,
            friendsWannabes: state.friendsWannabes.filter(friendsWannabe => {
                if (action.otherId !== friendsWannabe.id) {
                    return {
                        friendsWannabe
                    };
                }
            })
        };
    }

    if (action.type === "DELETE_FRIEND_REQUEST") {
        state = {
            ...state,
            friendsWannabes: state.friendsWannabes.filter(friendsWannabe => {
                if (action.otherId !== friendsWannabe.id) {
                    return {
                        friendsWannabe
                    };
                }
            })
        };
    }

    if (action.type === "TEN_MESSAGES") {
        state = {
            ...state,
            tenMsgs: action.tenMsgs
        };
    }

    if (action.type === "LAST_MESSAGE") {
        state = {
            ...state,
            msg: action.msg
        };
    }

    if (action.type === "NEW_USER") {
        state = {
            ...state,
            newUser: action.newUser
        };
    }

    if (action.type === "ONLINE") {
        state = {
            ...state,
            otherUserOnline: action.otherUserOnline
        };
    }

    if (action.type === "PRIVATEMESSAGE") {
        state = {
            ...state,
            Pmsg: action.Pmsg
        };
    }

    if (action.type === "PRIVAT_TWO_EMESSAGE") {
        state = {
            ...state,
            Pmsg: action.Pmsg
        };
    }

    return state;
}