import React, { useEffect } from "react";
import { useSelector } from "react-redux";

export default function Online() {
    const otherUserOnline = useSelector(
        state => state.otherUserOnline && state.otherUserOnline
    );
    const newUser = useSelector(
        state => state.newUser && state.newUser
    );

    useEffect(() => {
    }, [newUser]);

    return (
        <React.Fragment>
            <div className="Onlinecontainer">
                <h3 className="OnlineCommunity">Online community!</h3>
                {otherUserOnline && otherUserOnline.map(otherUserOnline => {
                    return <div className="OnlineUsers" key={otherUserOnline.id} >
                        <div className="Green"></div>
                        <a href={`http://localhost:8080/user/${otherUserOnline.id}`}>
                            <img width="100px" height="100px" src={otherUserOnline.url_profile}></img>
                            <p> {otherUserOnline.first} {otherUserOnline.last}</p>
                        </a>
                        <a href="http://localhost:8080/user/privatechat" >chat </a>
                    </div>;
                })}
                <div className="NewUSerONLINE">
                    <h3 className="OnlineCommunity">New user Online</h3>
                    {newUser && newUser.map(newUser => {
                        return <div className="NewUserOnline" key={newUser.id}>
                            <div className="Green"></div>
                            <img width="100px" height="100px" src={newUser.url_profile}></img>
                            <p> {newUser.first} {newUser.last}</p>
                        </div>;
                    })}
                </div>
            </div >
        </React.Fragment >
    );
}