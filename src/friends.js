import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { receiveFriendsWannaBe, acceptFriendRequest, declineFriendRequest, deleteFriendRequest } from "./actions";

export default function Friends() {
    const dispatch = useDispatch();
    const friendsAccepted = useSelector(
        state => state.friendsWannabes && state.friendsWannabes.filter(
            friendsWannabe => friendsWannabe.accepted == true
        )
    );
    const friendsWannaBeFalse = useSelector(
        state => state.friendsWannabes && state.friendsWannabes.filter(
            friendsWannabe => friendsWannabe.accepted == false
        )
    );

    useEffect(() => {
        dispatch(receiveFriendsWannaBe());
    }, []);

    return (
        <React.Fragment>
            <div className="friendsreqcur">
                <div className="imgprofileSMallFriendsLeft">
                </div>
                <div className="allFriendsFalse">
                    <h1 className="titleFalse">Friends pending</h1>
                    {friendsWannaBeFalse && friendsWannaBeFalse.map(friendsFalse => {
                        return <div className="friendsreqcurCardFalse" key={friendsFalse.id}>
                            <a href={`http://localhost:8080/user/${friendsWannaBeFalse[0].id}`}>
                                <img width="100px" height="100px" src={friendsFalse.url_profile}></img>
                                <h2 className="bfriends">{friendsFalse.first} {friendsFalse.last}</h2>
                            </a>
                            <div className="buttonAccNo">
                                <button onClick={() => dispatch(acceptFriendRequest(friendsFalse.id))}>
                                Accept Friend Request </button>
                                <button onClick={() => dispatch(deleteFriendRequest(friendsFalse.id))}> Nop </button>
                            </div>
                        </div>;
                    })}
                </div>
                <div className="allFriendsAcc">
                    <h1 className="titleAcc"> Your Friends</h1>
                    {friendsAccepted && friendsAccepted.map(friendsAcc => {
                        return <div className="friendsreqcurCard" key={friendsAcc.id}>
                            <a className="afriends" href={`http://localhost:8080/user/${friendsAccepted[0].id}`}>
                                <img width="100px" height="100px" src={friendsAcc.url_profile}></img>
                                <h2 className="afriends">{friendsAcc.first} {friendsAcc.last}</h2>
                            </a>
                            <button className="UnfriendAcc" onClick={() => dispatch(declineFriendRequest(friendsAcc.id))}>
                            Unfriend </button>
                            <Link className="privatechatFriend" to={{
                                pathname: "/privatechat",
                                state: { userid: friendsAccepted[0].id }
                            }} userid={friendsAccepted[0].id}> Chat </Link>
                        </div>;
                    })}
                </div>
                <div className="imgprofileSMallFriendsRight">
                </div>
            </div>
        </React.Fragment >
    );
}
