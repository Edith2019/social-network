import React from 'react';
import axios from './axios';


export default class Uploader extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            url: '',
            name: '',
            last: '',
            id: '',
            closeModal: ''
        };
    }

    componentDidMount() {
        console.log("uploader mounted");
    }

    uploadeImage() {
        //sending image to the server
        var formData = new FormData();
        formData.append('file', this.state.url);
        formData.append('id', this.state.id);
        axios.post('/upload/image', formData, {
        }).then(
            ({ data }) => {
                if (data) {
                    // console.log("to post route image");
                    const url = data.url_profile;
                    this.props.closeModal(url);
                } else {
                    this.setState({
                        error: true
                    });
                }
                ////////// CHECK FOR ERROR //////
            });
    }

    handleChange({ target }) {
        this.setState({
            [target.name]: target.files[0]
        });
    }

    render() {
        console.log("this.props", this.props);
        return (
            <React.Fragment>
                <div className="uploader">
                    <input name="url" type="file" accept="image/*" className="inputfileuploader" onChange={e => this.handleChange(e)} />
                    <button onClick={() => this.uploadeImage()}> Upload </button>
                </div>
            </React.Fragment>
        );
    }
}