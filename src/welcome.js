import React from "react";
import Registration from "./register";
import Login from "./login";
import Resetpw from "./resetpw";
import { HashRouter, Route } from "react-router-dom";

export default function Welcome() {
    return (
        <HashRouter>
            <div className="header"></div>
            <div className="welcome-container">
                <img className="imgWelcome" src="/Logo.png" alt="BigImg" />
                <div className="welcome">
                    <p className="titleWelcome">Welcome to social network project</p>
                    <Route exact path="/" component={Registration} />
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/resetpw" component={Resetpw} />
                </div>
            </div>
            <div className="footer"></div>
        </HashRouter>

    );

}
