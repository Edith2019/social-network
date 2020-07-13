import React from "react";
import axios from "./axios";
import PropTypes from "prop-types";

export default function DeleteAccount(props) {

    const deleteAcc = () => {
        axios.post("/delete", { url: props.url }).then(() => {
            location.replace("/welcome#/");
        });
    };

    return (
        <React.Fragment>
            <a id="logout" className="linkprofile" onClick={deleteAcc}> Delete Account </a>
        </React.Fragment>
    );
}

DeleteAccount.propTypes = {
    url: PropTypes.string
};