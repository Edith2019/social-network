import React from 'react';

export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            first: '',
            last: '',
            biography: 'something else',
            url: '',
            id: '',
            uploaderIsVisible: false,
            newBio: '',
        };
        // console.log("props in profile", props);
        // console.log("this.props.biography in profile", this.props.biography);
        // console.log("this.props.setBio in profile", this.props.setBio);
        // console.log("this.state.newBio in profile", this.state.newBio);
        // console.log("this.props.newBio in profile", this.props.newBio);
        // console.log("this props in profile checksetbio", this.props);
        // console.log("this.state.bio", this.state.biography);
        // console.log("this profile pic", this.props.url);
        // console.log("this profile pic", this.state.url);
        // console.log(this.props.profilePic);
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