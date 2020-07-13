import React from "react";
import axios from "./axios";
import ProfilePic from "./profilePic";
import Uploader from "./uploader";
import Profile from "./profile";
import Biography from "./biography";
import { BrowserRouter, Route } from "react-router-dom";
import OtherProfile from "./otherprofile.js";
import FindProfile from "./FindProfile.js";
import Friends from "./friends";
import Chat from "./chat";
import PrivateChat from "./privatechat";
import Online from "./onlineusers";
import Logout from "./logout";
import DeleteAccount from "./deleteaccount";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            first: "",
            last: "",
            biography: "",
            url: "",
            id: "",
            uploaderIsVisible: false,
            bioEditorIsVisible: false,
            profilePic: "",
            newBio: "",
            bio: "",
            success: false
        };
    }

    componentDidMount() {
        axios.get("/getloggeddata").then(res => {
            this.setState({
                first: res.data.first,
                last: res.data.last,
                biography: res.data.biography,
                url: res.data.url,
                id: res.data.id
            });
        });
    }

    toggleModal() {
        this.setState({
            uploaderIsVisible: !this.state.uploaderIsVisible
        });
    }
    togglePrivatChatModal() {
        this.setState({
            uploaderIsVisible: !this.state.uploaderIsVisible
        });
    }

    toggleModalBio() {
        this.setState({
            uploaderIsVisible: !this.state.bioEditorIsVisible
        });
    }

    setBio(biography) {
        this.setState({
            bioEditorIsVisible: !this.state.bioEditorIsVisible,
            biography: biography
        });
    }

    closeModal(url) {
        this.setState({
            uploaderIsVisible: !this.state.uploaderIsVisible,
            url: url
        });
    }

    render() {
        return (
            <React.Fragment>
                <BrowserRouter>
                    <div className="profile">
                        <a className="logoref" href="https://swork-berlin.herokuapp.com/welcome#/">
                            <img src="/Logo.png" className="logo" alt="logo" width="100px" height="100px" />
                        </a>
                        <a className="linkprofile" href="https://swork-berlin.herokuapp.com/users">Find Friends</a>
                        <a className="linkprofile" href="https://swork-berlin.herokuapp.com/friends">My Friends</a>
                        <a className="linkprofile" href="https://swork-berlin.herokuapp.com/chat">Chat</a>
                        <a className="linkprofile" href="https://swork-berlin.herokuapp.com/online"> Online</a>
                        <img onClick={() => this.toggleModal()}
                            className="imgprofile"
                            src={this.state.url}
                            width="100px"
                            height="100px" />
                    </div>
                    <Route exact path="/" render={() =>
                        <div className="profile-page">
                            <Profile
                                first={this.state.first}
                                last={this.state.last}
                                profilePic={
                                    <ProfilePic
                                        first={this.state.first}
                                        last={this.state.last}
                                        url={this.state.url}
                                        id={this.state.id}
                                    />
                                }
                                biography={
                                    <div className="biography-done">
                                        <Biography
                                            biography={this.state.biography}
                                            setBio={biography => this.setBio(biography)}
                                        />
                                    </div>
                                }
                            />
                        </div>
                    }
                    />
                    <Route path="/user/:id" component={OtherProfile} />
                    {
                        this.state.uploaderIsVisible && <Uploader
                            closeModal={url => this.closeModal(url)}
                        />
                    }
                    <Route path="/users" component={FindProfile} />
                    <Route exact path="/friends" component={Friends} />
                    <Route exact path="/chat" component={Chat} />
                    <Route exact path="/privatechat" component={PrivateChat} />
                    <Route exact path="/online" component={Online} />
                    <div className="footer">
                        <Logout />
                        <DeleteAccount url={this.state.url} />
                    </div>
                </BrowserRouter>
            </React.Fragment>
        );
    }
}