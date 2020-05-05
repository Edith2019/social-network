

//if reducer ispassed the state good if not, will create one

export default function reducer(state = {}, action) {

    if (action.type === 'RECEIVE_FRIENDS_WANNABES') {
        state = {
            ...state,
            friendsWannabes: action.friendsWannabes
        };
    }

    if (action.type === 'ACCEPT_FRIEND_REQUEST') {
        state = {
            ...state,
            friendsWannabes: state.friendsWannabes.map(friendsWannabe => {
                // console.log("friendsWannabes in reducer", friendsWannabe);
                // console.log("actipn friends wannabe", action);
                if (action.otherId === friendsWannabe.id) {
                    friendsWannabe.accepted = true;
                    return friendsWannabe;
                } else {
                    return friendsWannabe;
                }
            })
        };
    }
    if (action.type === 'DECLINE_FRIEND_REQUEST') {
        state = {
            ...state,
            friendsWannabes: state.friendsWannabes.filter(friendsWannabe => {
                console.log("friend wanna be ni decline friend", friendsWannabe);
                if (action.otherId !== friendsWannabe.id) {
                    return {
                        friendsWannabe,
                    };
                }
            })
        };
    }

    if (action.type === 'DELETE_FRIEND_REQUEST') {
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

    if (action.type === 'TEN_MESSAGES') {
        console.log("ten msgs in reducer");
        state = {
            ...state,
            tenMsgs: action.tenMsgs
        };
    }

    if (action.type === 'LAST_MESSAGE') {
        console.log("ten msgs in reducer");
        state = {
            ...state,
            msg: action.msg
        };
        // console.log("state in reducer msg", state.msg);
    }

    if (action.type === 'NEW_USER') {
        // console.log("newuser in reducer");
        state = {
            ...state,
            newUser: action.newUser

        };
        // console.log("newUser in reducer", state.newUser);
    }

    if (action.type === 'ONLINE') {
        // console.log("online in reducer");
        state = {
            ...state,
            otherUserOnline: action.otherUserOnline
        };
        // console.log("nonline userr in reducer", state.otherUserOnline);
    }

    if (action.type === 'PRIVATEMESSAGE') {
        console.log("Privatein reducer");
        state = {
            ...state,
            Pmsg: action.Pmsg
        };
        console.log("pmsg in reducer", state.Pmsg);
    }

    if (action.type === 'PRIVAT_TWO_EMESSAGE') {
        console.log("Privatein reducer");
        state = {
            ...state,
            Pmsg: action.Pmsg
        };
        console.log("pmsg in reducer", state.Pmsg);
    }

    return state;
}