import React from 'react';
import axios from './axios';
import FriendButton from './friendbutton';

export default class OtherProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: '',
            otherUserId: '',
        };
    }

    componentDidMount() {
        const id = this.props.match.params.id;
        // console.log("id in the compoenent mounted otherprofile", id);
        axios.get(`/user/${id}.json`).then(
            data => {
                // console.log("data in res ", data);
                if (data.data.redirect) {
                    this.props.history.push('/');
                } else {
                    this.setState({
                        first: data.data.data.first,
                        last: data.data.data.last,
                        biography: data.data.data.biography,
                        url: data.data.data.url_profile,
                        currenturl: data.data.data.url_profile,
                    });
                }
            }
        );
    }

    render() {
        return (
            <React.Fragment>
                <div className="otherprofile-container" >
                    <div className="profileCard">
                        <div className="otherprofile">
                            <img className="imgotherprofileRight" src={this.state.currenturl} width="200px" height="200px" />
                            <h1 className="titleOtherPro">{this.state.first} {this.state.last}</h1>
                            <p className="bioOtherPro">{this.state.biography} </p>
                        </div>
                        <FriendButton otherUserId={this.props.match.params.id} />
                    </div>
                </div>
            </React.Fragment >
        );
    }
}