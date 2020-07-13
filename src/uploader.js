import React from "react";
import axios from "./axios";
import PropTypes from "prop-types";

export default class Uploader extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            url: "",
            name: "",
            last: "",
            id: "",
            closeModal: ""
        };
    }

    uploadeImage() {
        var formData = new FormData();
        formData.append("file", this.state.url);
        formData.append("id", this.state.id);
        axios.post("/upload/image", formData, {
        }).then(
            ({ data }) => {
                if (data) {
                    const url = data.url_profile;
                    this.props.closeModal(url);
                } else {
                    this.setState({
                        error: true
                    });
                }
            });
    }

    handleChange({ target }) {
        this.setState({
            [target.name]: target.files[0]
        });
    }

    render() {
        return (
            <React.Fragment>
                <div className="uploader">
                    <input name="url"
                        type="file"
                        accept="image/*"
                        className="inputfileuploader"
                        onChange={e => this.handleChange(e)} />
                    <button onClick={() => this.uploadeImage()}> Upload </button>
                </div>
            </React.Fragment>
        );
    }
}

Uploader.propTypes = {
    closeModal: PropTypes.func
};