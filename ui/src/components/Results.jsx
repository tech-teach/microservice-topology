import React, { Component } from 'react';

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

import TaskService from '../services/task';

const taskService =  new TaskService();

const styles = {
  uploadButton: {
    verticalAlign: 'middle',
  }
};

class Results extends Component {

  constructor(props) {
    super(props);
    this.taskProgressIntervalId = null;
    this.cancelIntervalId = null;
    this.state = {
      taskStatus: null,
      taskResults: null,
      taskProgress: 0,
      taskErrors: [],
      cancelVisible: true
    };
  }

  progressIntervalKiller() {
    console.log(this.state);
    if(this.state.taskProgress === 1) {
      clearInterval(this.taskProgressIntervalId);
      this.setState({cancelVisible: false});
      this.props.onEnd();
    }
  }

  componentDidMount() {
    if (this.props.uid) {
      this.taskProgressIntervalId = setInterval(
        () => taskService.fetch(this.props.uid, res => (
            this.setState(
              {
                taskResults: res.body.accuracies,
                taskProgress: res.body.progress,
                taskStatus: res.body.status,
                taskErrors: res.body.errors
              },
              () => this.progressIntervalKiller()
            )
          )
        ),
        1000,
      );
    } else {
      this.setState({
        taskResults: null,
        taskProgress: 0
      })
    }
  }

  componentWillUnmount() {
    this.setState({taskResults: null, taskProgress: 0});
  }

  cancelIntervalKiller(){
    if(this.state.taskStatus === 'complete') {
      clearInterval(this.cancelIntervalId);
      this.props.onEnd();
    }
  }

  fetchTaskEnd() {
    this.cancelIntervalId = setInterval(
      () => taskService.fetch(this.props.uid, res => (
          this.setState(
            { taskStatus: res.body.status },
            () => this.cancelIntervalKiller()
          )
        )
      ),
      1000,
    );
  }

  cancelTask() {
    if (this.props.uid) {
      this.setState({cancelVisible: false});
      this.progressIntervalKiller();
      taskService.cancel(this.props.uid, res => this.fetchTaskEnd());
    }
  }

  render() {
    return (
      <MuiThemeProvider>
        <div>
          <center>
            <p>progress of task: {(this.state.taskProgress * 100).toFixed(0)}%</p>
            <CircularProgress
              mode="determinate"
              value={this.state.taskProgress * 100}
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
              {_.map(this.state.taskResults, (accuracy, id) => (
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
