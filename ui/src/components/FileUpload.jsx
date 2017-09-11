import React from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';


class FileUpload extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Form method='POST' action={this.props.route} encType='multipart/form-data'>
            <FormGroup>
                <Label for="exampleFile">File</Label>
                <Input type="file" name="file" id="exampleFile" required multiple/>
                <FormText color="muted">
                Aquí el archivo
                </FormText>
            </FormGroup>
            <FormGroup tag="fieldset">
                <legend>Radio Buttons</legend>
                <FormGroup check>
                    <Label check>
                    <Input type="radio" name="radio1" />{' '}
                    Uno
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                    <Input type="radio" name="radio1" />{' '}
                    Dos
                    </Label>
                </FormGroup>
            </FormGroup>
            <Button>Submit</Button>
            </Form>
        );
    }
}

export default FileUpload;