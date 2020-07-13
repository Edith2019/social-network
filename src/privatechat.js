import React, { useEffect, useRef, useState } from "react";
import { socket } from "./socket";
import { useSelector } from "react-redux";
import axios from "./axios";
import PropTypes from "prop-types";

export default function PrivateChat(props) {
    const elemRef = useRef();
    const [users, setUsers] = useState([]);
    const chatPMessages = useSelector(
        state => state.Pmsg && state.Pmsg
    );

    useEffect(() => {
        const otherChatterId = props.location.state.userId;
        axios.get(`/otherChatterData/${otherChatterId}`).then(result => {
            if (result.data.length != 0) {
                setUsers(result.data);
            }
        });
    }, []);

    const keyCheck = e => {
        if (e.key === "Enter") {
            e.preventDefault();
            socket.emit("chatPrivateMessage", e.target.value);// Emit msg to server chatmessage grabbing the input field
            e.target.value = "";
        }
    };

    return (
        <React.Fragment>
            <div className="chatP">
                {users && users.map((users) => {
                    return <div className="Key" key={users.id}>
                        <h1 className="privateChatTitle">Private Chat with {users.first} {users.last}</h1>
                    </div>;
                })}
                <div className="Chatborder">
                    <div className="chatmessagesContainer" >
                        {users && users.map((users) => {
                            return <div className="boxPrivateChat" key={users.id}>
                                <img className="imageChat" width="50px" height="50px" src={users.url_profile} />
                            </div>;
                        })}
                        <div className="messageChat"> I found this
                            <a className="linktosupport"
                                href="https://www.frauenrechte.de/en/our-work/focus-areas/domestic-violence">
                                    new Make up</a>
                                    that is so great!</div>
                        <p className="messageChat">Look at this cute cat picture</p>
                        <img className="messageChat" src="/images.jpeg" />
                        <div ref={elemRef}>
                            {chatPMessages && chatPMessages.map(chatPMessages => {
                                return <div className="boxChat" key={chatPMessages.id}>
                                    <img className="imageChat" width="50px" height="50px" src={chatPMessages.url_profile} />
                                    <div className="messageTitle">
                                        <p className="messageChat">{chatPMessages.message}</p>
                                    </div>
                                </div>;
                            })}
                        </div>
                    </div>
                </div>
                <textarea className="textAreaChat" placeholder="add you message here" onKeyDown={keyCheck}></textarea>
            </div >
        </React.Fragment >
    );
}

PrivateChat.propTypes = {
    location: PropTypes.string
};