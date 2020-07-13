import React, { useEffect, useRef } from "react";
import { socket } from "./socket";
import { useSelector } from "react-redux";

export default function Chat() {
    const elemRef = useRef();
    const chatMessages = useSelector(
        state => state.tenMsgs && state.tenMsgs
    );

    const chatMessage = useSelector(
        state => state.msg && state.msg
    );

    // this will be undefined as the code is not written //
    useEffect(() => {
        elemRef.current.scrollTop = elemRef.current.scrollHeight - elemRef.current.clientHeight;
    }, [chatMessages]);

    const keyCheck = e => {
        if (e.key === "Enter") {
            e.preventDefault();
            socket.emit("chatMessage", e.target.value);// Emit msg to server chatmessage grabbing the input field
            e.target.value = "";// re set he value to be empty field
        }

    };

    return (
        <React.Fragment>
            <div className="chat">
                <h1 className="chatTitle">Welcome to Chat</h1>
                <div className="Chatborder">
                    <div className="chatmessagesContainer" ref={elemRef}>
                        {chatMessages && chatMessages.map(chatMessages => {
                            return <div className="boxChat" key={chatMessages.id}>
                                <img className="imageChat" width="50px" height="50px" src={chatMessages.url_profile} />
                                <div className="messageTitle">
                                    <p className="nameChat">{chatMessages.first} {chatMessages.last}</p>
                                    <p className="messageChat">{chatMessages.message}</p>
                                </div>
                            </div>;

                        })}
                        {chatMessage && chatMessage.map(chatMessage => {
                            return <div className="boxChat" key={chatMessage.id}>
                                <img className="imageChat" width="50px" height="50px" src={chatMessage.url_profile} />
                                <div className="messageTitle">
                                    <p className="nameChat">{chatMessage.first} {chatMessage.last}</p>
                                    <p className="messageChat">{chatMessage.message}</p>
                                </div>
                            </div>;
                        })}

                    </div>
                </div>
                <textarea className="textAreaChat" placeholder="add you message here" onKeyDown={keyCheck}></textarea>
            </div>
        </React.Fragment>
    );
}