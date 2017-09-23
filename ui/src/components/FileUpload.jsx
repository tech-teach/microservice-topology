import React from 'react';
import request from 'superagent';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FlatButton from 'material-ui/FlatButton';


const styles = {
  uploadButton: {
    verticalAlign: 'middle',
  },
  uploadInput: {
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    width: '100%',
    opacity: 0,
  },
};


class FileUpload extends React.Component {
    constructor(props) {
        super(props);
        this.intervalId = null;
        this.state = {
          res: null,
        };
    }

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

    submitForm(event) {
        document.getElementById("form-group").submit();
        event.preventDefault();
    }

    render() {
        return (
            <MuiThemeProvider>
            <form
                className="form-group"
                encType="multipart/form-data"
                onSubmit={this.sendFile.bind(this)}
                id="form-group" >
                <FlatButton
                  label="Upload here CSV file"
                  labelPosition="before"
                  style={styles.uploadButton}
                  containerElement="label"
                >
                <input style={styles.uploadInput} name='file' id="uploadFile" type="file" className="form-group" />
                </FlatButton>
                <br />
                <FlatButton
                  label="Process CSV"
                  labelPosition="before"
                  style={styles.uploadButton}
                  containerElement="label"
                >
                    <input style={styles.uploadInput} type="submit" className="btn btn-primary" value="Upload" />
                </FlatButton>
            </form>
            </MuiThemeProvider>
        );
    }
}

export default FileUpload;