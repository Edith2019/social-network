import React, { useState, useEffect } from "react";
import axios from "./axios";
import PropTypes from "prop-types";

export default function FriendButton({ otherUserId }) {
    const [buttonText, setButtonText] = useState("something");
    const [error, setError] = useState(false);
    useEffect(() => {
        axios.get(`/initial-friendship-status/${otherUserId}`).then(
            data => {
                if (data.data && data.data.addFriend === true) {
                    setButtonText("Send Friend Request");
                } else if (data.data && data.data.unfriend === true) {
                    setButtonText("Unfriend");
                } else if (data.data && data.data.acceptFrequest === true) {
                    setButtonText("Accept Friend Request");
                } else if (data.data && data.data.cancelFrequest === true) {
                    setButtonText("Cancel Friend Request");
                } else
                    setError(true)
                    ;
            }
        );
    }, []);

    const handleClick = () => {
        if (buttonText == "Send Friend Request") {
            axios.post(`/make-friend-request/${otherUserId}`).then(
                data => {
                    if (data.data.data == true) {
                        setButtonText("Cancel Friend Request");
                    } else {
                        setError(true);
                    }
                });
        } else if (buttonText == "Cancel Friend Request" || buttonText == "Unfriend") {
            axios.post(`/end-friendship/${otherUserId}`).then(
                data => {
                    if (data.data.data == true) {
                        setButtonText("Send Friend Request");
                    } else {
                        setError(true);
                    }
                });
        } else if (buttonText == "Accept Friend Request") {
            axios.post(`/add-friendship/${otherUserId}`).then(
                data => {
                    if (data.data.data == true) {
                        setButtonText("Unfriend");
                    } else {
                        setError(true);
                    }
                });
        }
    };

    return <button className="friendButton" onClick={handleClick}>{buttonText}</button>;
}

FriendButton.propTypes = {
    otherUserId: PropTypes.string
};