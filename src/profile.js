import React from "react";
import PropTypes from "prop-types";

export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            first: "",
            last: "",
            biography: "something else",
            url: "",
            id: "",
            uploaderIsVisible: false,
            newBio: ""
        };
    }

    render() {
        return (
            <React.Fragment>
                <div className="selfprofile">
                    {this.props.profilePic}
                    {this.props.biography}
                    {this.props.setBio}
                </div>
            </React.Fragment>
        );
    }
}

Profile.propTypes = {
    profilePic: PropTypes.object,
    biography: PropTypes.object,
    setBio: PropTypes.func
};