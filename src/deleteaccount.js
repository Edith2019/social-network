import React, { Component, useState } from "react";
import axios from "./axios";

export default function DeleteAccount(props) {
    // console.log("props in deleteaccount", props);
    const [error, setError] = useState(false);

    const deleteAcc = () => {
        // console.log("url in delete", props.url);
        axios.post('/delete', { url: props.url }).then(() => {
            // console.log("url in delete", props.url);
            location.replace("/welcome#/");
        });
    };

    return (
        <React.Fragment>
            <a id="logout" className="linkprofile" onClick={deleteAcc}> Delete Account </a>
        </React.Fragment>
    );
}