import React, { Component } from "react";
import axios from "./axios";

export default class Logout extends Component {
    constructor() {
        super();
        this.state = {};
    }

    logout() {
        axios.get("/logout").then(() => {
            location.replace("/welcome#/login");
        });
    }

    render() {
        return (
            <a className="linkprofile" id="logout" onClick={() => this.logout()}> Logout </a>
        );
    }
}