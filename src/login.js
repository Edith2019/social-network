import React from 'react';
import axios from './axios'; //need to put the slash to use the copy
import { Link } from 'react-router-dom';

export default class Login extends React.Component {
    constructor(props) { //props are all the data you want to apss props
        super(props); // add a property to the instence props
        this.state = {
            error: false
        };
    }

    submit() {
        axios.post('/login', {
            email: this.state.email,
            pw: this.state.pw,
        }).then(
            ({ data }) => {
                if (data.success) {
                    location.replace('/');
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
            <div className="login">
                {this.state.error && <div className="error">Oops</div>}
                <input type="email" name="email" placeholder="email" onChange={e => this.handleChange(e)} />
                <input type="password" name="pw" placeholder="password" onChange={e => this.handleChange(e)} />
                <button className="buttonLogin" onClick={() => this.submit()}> login </button>

                <Link className="resetpwlogin" to="/resetpw"> reset-password</Link>
            </div >
        );
    }

} 