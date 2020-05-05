import React from 'react';
import axios from './axios'; //need to put the slash to use the copy
import { Link } from 'react-router-dom';

export default class Resetpw extends React.Component {
    constructor(props) { //props are all the data you want to apss props
        super(props); // add a property to the instence props
        this.state = {
            step: 0,
        };
    }

    getEmail() {
        axios.post('/password/reset/start', {
            email: this.state.email,
        }).then(
            ({ data }) => {
                if (data.success) {
                    this.setState({
                        step: 1
                    });
                } else {
                    this.setState({
                        error: true
                    });
                }
            }
        );
    }

    getCode() {
        axios.post('/password/reset/verify', {
            email: this.state.email,
            code: this.state.code,
            newPw: this.state.newPw,
        }).then(
            ({ data }) => {
                if (data.success) {
                    this.setState({
                        step: 2
                    });
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

    getCurrentDisplay() {
        const step = this.state.step;
        if (step == 0) {
            return (
                <div className="login">
                    {this.state.error && <div className="error">Oops</div>}
                    <p className="textResetPw"> Please enter the email you registered with !!</p>
                    <input className="resetPWinput" input key="email" type="email" name="email" placeholder="email" onChange={e => this.handleChange(e)} />
                    <button onClick={() => this.getEmail()}> submit </button>
                </div >
            );
        } else if (step == 1) {
            return (
                <div className="login">
                    {this.state.error && <div className="error">Oops</div>}
                    <p className="textResetPw"> Please enter the code you received !</p>
                    <input className="resetPWinput" key="secret-code" type="text" name="code" placeholder="code" onChange={e => this.handleChange(e)} />
                    <p className="textResetPw">Please enter your new password !</p>
                    <input type="password" name="newPw" placeholder="new password" onChange={e => this.handleChange(e)} />
                    <button onClick={() => this.getCode()}> submit </button>
                </div>
            );
        } else if (step == 2) {
            return (
                <div className="login">
                    {this.state.error && <div className="error">Oops</div>}
                    <p className="textResetPwsucc">password has been updated successfully.</p>
                    <Link to="/login"> Please login</Link>
                </div>
            );
        }
    }

    render() {
        return (
            <div >
                {this.getCurrentDisplay()}
            </div>
        );
    }
}
