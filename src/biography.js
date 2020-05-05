import React from 'react';
import axios from './axios';

export default class Biography extends React.Component {
    constructor(props) { //props are all the data you want to apss props
        super(props); // add a property to the instence props
        this.state = {
            bioEditorIsVisible: false,
            newBio: '',
            biography: '',
            bioInProgress: '',
        };
    }

    toggleModal() {
        this.setState({
            bioEditorIsVisible: !this.state.bioEditorIsVisible

        });
    }

    handleChange({ target }) {
        this.setState({
            [target.name]: target.value
        });
    }

    submit() {

        const newBio = {
            biography: this.state.bioInProgress
        };
        console.log("new bio to upload", newBio);
        axios.post('/upload/biography', newBio, {

        }).then(
            ({ data }) => {
                console.log("data in post bio", data);
                if (data) {
                    this.props.setBio(data.biography);
                    this.setState({
                        bioEditorIsVisible: !this.state.bioEditorIsVisible,
                        newBio: this.state.biography,
                    });
                } else {
                    this.setState({
                        error: true
                    });
                }
            });
    }

    getCurrentBio() {

        if (!this.props.biography && this.state.bioEditorIsVisible === false) {
            return (<div className="biography">
                {this.state.error && <div className="error">Oops</div>}
                <button className="biobutton" onClick={() => this.toggleModal()}>add a biography</button>
            </div>);
        } else if (this.state.bioEditorIsVisible == true) {
            return (<div className="biography">
                {this.state.error && <div className="error">Oops</div>}
                <textarea className="bioInProgress" id="bioTextArea" name="bioInProgress" rows="5" cols="90" onChange={e => this.handleChange(e)}></textarea>
                <button className="biobutton" onClick={() => this.submit()}>save</button>
            </div >);
        } else if (this.props.biography && this.state.bioEditorIsVisible === false) {
            return (<div className="biography">
                {this.state.error && <div className="error">Oops</div>}
                <button className="biobutton" onClick={() => this.submit()}>edit </button>
            </div>);
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className="biowritten">
                    {this.props.biography}
                </div>
                {this.getCurrentBio()}
                {this.props.setBio}
            </React.Fragment>
        );
    }
}