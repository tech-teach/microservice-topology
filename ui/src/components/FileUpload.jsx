import React from 'react';
import request from 'superagent';


class FileUpload extends React.Component {
    constructor(props) {
        super(props);
        this.intervalId = null;
        this.state = {
          res: null,
        };
    }

    openFile(file) {
        var reader = new FileReader();
        reader.readAsText(file);
    };

    sendFile(event) {
        event.preventDefault();
        const file = event.target.file.files[0];
        console.log(file);
        request
            .post('http://localhost/tasks')
            .attach('file', file)
            .then(res => {
                console.log(res);
            }, err => {
                console.log(err);
            })
    }

    render() {
        return (
            <form
                className="form-group"
                encType="multipart/form-data"
                onSubmit={this.sendFile.bind(this)} >
                <input name='file' id="uploadFile" type="file" className="form-group" />
                <input type="submit" className="btn btn-primary" value="Upload" />
            </form>
        );
    }
}

export default FileUpload;