import React, { Component } from 'react';
import TaskService from '../services/task';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import _ from 'lodash';


const styles = {
  uploadButton: {
    verticalAlign: 'middle',
  }
};

class Results extends Component {

  constructor(props) {
    super(props);
    this.intervalId = null;
    this.state = {
      results: null,
      progress: 0,
      cancelVisible: true
    };
  }

  componentDidMount() {
    const task = new TaskService();
    if (this.props.uid) {
      this.intervalId = setInterval(
        () => task.fetch(this.props.uid, res => (
          res.body.status === 'in progress' && !res.body.canceled
        ) ? (
            this.setState(
              { results: res.body.accuracies, progress: res.body.progress }
            )
          ) : (
            this.componentWillUnmount(res)
          )
        ),
        1000,
      );
    } else {
      this.setState({
        results: null,
        progress: 0
      })
    }
  }

  componentWillUnmount(res) {
    if (res) {
      this.setState(
        {
          results: res.body.accuracies,
          progress: res.body.progress,
          cancelVisible: false
        }
      );
    } else {
      this.setState({
        results: null, progress: 0
      });
    }
    this.props.onEnd();
    clearInterval(this.intervalId);
  }

  cancelTask() {
    const task = new TaskService();
    if (this.props.uid) {
      this.props.onEnd()
      task.cancel(this.props.uid, res => (
        console.log(res)
      )
      )
    }
  }

  render() {
    return (
      <MuiThemeProvider>
        <div>
          <center>
            <p>progress of task: {(this.state.progress * 100).toFixed(0)}%</p>
            <CircularProgress
              mode="determinate"
              value={this.state.progress * 100}
              size={30}
              thickness={3}
              max={100}
            />
          </center>
          {this.state.cancelVisible ? (
            <FlatButton
              label="Cancel Task"
              labelPosition="before"
              style={styles.uploadButton}
              containerElement="label"
              onClick={this.cancelTask.bind(this)}
            ></FlatButton>
          ) : (
              ""
            )}
          <Table>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
              <TableRow>
                <TableHeaderColumn>Metric</TableHeaderColumn>
                <TableHeaderColumn>Accuracy</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {_.map(this.state.results, (accuracy, id) => (
                <TableRow key={id}>
                  <TableRowColumn>
                    {accuracy.name}
                  </TableRowColumn>
                  <TableRowColumn>
                    {accuracy.result}
                  </TableRowColumn>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </MuiThemeProvider>
    );
  }
}


export default Results;
