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

    sendFile() {
        var files = document.getElementById("uploadFile").files;
        var text = files[0].getAsText("utf-8");
        request
            .post('http://localhost/tasks')
            .send({'file': text})
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .then(res => {
                console.log(res);
            }, err => {
                console.log(err);
            })
    }

    render() {
        return (
            <form className="form-group">
                <input id="uploadFile" type="file" encType="multipart/form-data" className="form-group" />
                <button onClick={this.sendFile.bind(this)} className="btn btn-primary">Upload</button>
            </form>
        );
    }
}

export default FileUpload;