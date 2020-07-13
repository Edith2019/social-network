import React from "react";
import axios from "./axios"; // need to put the slash to use the copy
import { Link } from "react-router-dom";

export default class Registration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: false
        };
    }

    submit() {
        axios.post("/register", {
            first: this.state.first,
            last: this.state.last,
            email: this.state.email,
            pw: this.state.pw
        }).then(
            ({ data }) => {
                if (data.success) {
                    location.replace("/");
                } else {
                    this.setState({
                        error: true
                    });
                }
            }
        );
    }

    handleChange({ target }) {
        this.setState({
            [target.name]: target.value
        });
    }

    render() {
        return (
            <div >
                {this.state.error && <div className="error">Oops</div>}
                <div className="inputReg">
                    <input type="text" name="first" placeholder="first name" onChange={e => this.handleChange(e)} />
                    <input type="text" name="last" placeholder="last name" onChange={e => this.handleChange(e)} />
                    <input type="email" name="email" placeholder="email" onChange={e => this.handleChange(e)} />
                    <input type="password" name="pw" placeholder="password" onChange={e => this.handleChange(e)} />
                    <button onClick={() => this.submit()}>Register</button>
                    <div className="linksReg">
                        <Link className="loginmarg" to="/login">login</Link>
                        <Link to="/resetpw">reset-password</Link>
                    </div>
                </div>
            </div >
        );
    }

}

