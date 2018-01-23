import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import _ from 'lodash';

import { Line } from 'react-chartjs-2';

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
      cancelVisible: true,

      snackOpen: false,
      snackMessage: '',
      snackHideDuration: 3000,

      showLineChart: false,
    };
  }

  progressIntervalKiller() {
    console.log(this.state);
    if((this.state.taskStatus === 'complete' || this.state.taskStatus === 'aborted') && this.taskProgressIntervalId) {
      clearInterval(this.taskProgressIntervalId);

      let messageTemp = this.state.taskStatus === 'complete'?'Completed':'Aborted';
      this.setState({
        cancelVisible: false,
        snackOpen:true,
        snackMessage: messageTemp,
        showLineChart: this.state.taskStatus === 'complete',
      });
      this.taskProgressIntervalId = null;
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
    if(this.state.taskStatus === 'aborted') {
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

  handleRequestSnackClose = () => {
    this.setState({
      snackOpen: false,
      snackMessage: ''
    });
  }

  render() {
    return (
      <MuiThemeProvider>
        <div>
          <center>
            <p>progress of task: {this.state.taskProgress.toFixed(0)}%</p>
            <CircularProgress
              mode="determinate"
              value={this.state.taskProgress}
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
                <TableHeaderColumn>Time in secs</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {_.map(this.state.taskResults, (accuracy, id) => (
                <TableRow key={id}>
                  <TableRowColumn>
                    {accuracy.name}
                  </TableRowColumn>
                  <TableRowColumn>
                    {accuracy.result || 'Waiting...'}
                  </TableRowColumn>
                  <TableRowColumn>
                    {accuracy.time || 'Waiting...'}
                  </TableRowColumn>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        {this.props.language === 'Python' && this.state.showLineChart && (
          <Line
            data={{
              labels: this.state.taskResults.map(tr => tr.name),
              datasets: [{
                label: 'Time',
                yAxisID: 'Time',
                backgroundColor: 'rgba(46,154,254,0.2)',
                borderColor: 'rgba(46,154,254,1)',
                data: this.state.taskResults.map(tr => tr.time)
              }, {
                label: 'Accuracy',
                yAxisID: 'Accuracy',
                backgroundColor: 'rgba(46,200,254,0.2)',
                borderColor: 'rgba(46,200,254,1)',
                data: this.state.taskResults.map(tr => tr.result)
              }]
            }}
            options={{
              scales: {
                yAxes: [{
                  id: 'Time',
                  type: 'linear',
                  position: 'left',
                  scaleLabel: {
                    display: true,
                    labelString: 'Time'
                  },
                }, {
                  id: 'Accuracy',
                  type: 'linear',
                  position: 'right',
                  ticks: {
                    max: 1,
                    min: 0
                  },
                  scaleLabel: {
                    display: true,
                    labelString: 'Accuracy'
                  },
                }]
              },
              title: {
                  display: true,
                  text: this.props.fileName
              }
            }}
          />
        )}
        <Snackbar
          open={this.state.snackOpen}
          action="Ok"
          message={this.state.snackMessage}
          autoHideDuration={this.state.snackHideDuration}
          onActionTouchTap={this.handleRequestSnackClose}
          onRequestClose={this.handleRequestSnackClose}
        />
        </div>
      </MuiThemeProvider>
    );
  }
}


export default Results;
