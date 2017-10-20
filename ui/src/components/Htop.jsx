import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HtopService from '../services/htop';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import _ from 'lodash';
import request from 'superagent';
import {Radar} from 'react-chartjs-2';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import Results from './Results'
import CoreCountService from '../services/cpu'

const style = {
  height: 300,
  width: 300,
  margin: 10,
  textAlign: 'center',
  display: 'inline-block',
};

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

class Htop extends Component {

  constructor(props) {
    super(props);
    this.intervalId = null;
    this.state = {
      uid: null,
      cpu: null,
      memory: null,
      dataUsage: null,
      dataFrequency: null,
      maxFrequency: 0,
      activeUploadButtons: true,
      coreCount: 1
    };
  }

  sendFile(event) {
    const file = event.target.file.files[0];
    this.setState({activeUploadButtons: false});
    console.log(file);
    request
      .post('/tasks')
      .attach('file', file)
      .then(res => {
        console.log(res);
        this.setState(
          {uid: res.body.uid}
        )
      }, err => {
        console.log(err);
      })
    event.preventDefault();
  }

  componentDidMount() {
    const coreCountService = new CoreCountService();
    coreCountService.get(
      res => console.log('Core count:' + res.body.coreCount)//this.setState({coreCount: res.body.coreCount})
    );
    const htop = new HtopService();
    this.intervalId = setInterval(
      () => htop.get(res => this.setState(
        {
          cpu: res.body.cpu,
          memory: res.body.memory,
          dataUsage: {
            labels: _.range(res.body.cpu.length),
            datasets: [{
              label: 'CPU Usage',
              backgroundColor: 'rgba(46,154,254,0.2)',
              borderColor: 'rgba(46,154,254,1)',
              pointBackgroundColor: 'rgba(46,154,254,0.5)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(255,99,132,1)',
              data: res.body.cpu.map((cpu) => cpu.percent)
            }]
          },
          dataFrequency: {
            labels: _.range(res.body.cpu.length),
            datasets: [{
              label: 'CPU Frequency',
              backgroundColor: 'rgba(46,154,254,0.2)',
              borderColor: 'rgba(46,154,254,1)',
              pointBackgroundColor: 'rgba(46,154,254,0.5)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(255,99,132,1)',
              data: res.body.cpu.map((cpu) => cpu.frequency.current)
            }]
          },
          maxFrequency: res.body.cpu[0].frequency.max
        },
      )),
      this.props.ms,
    );
  }

  uploadAgain = () => {
    this.setState({
      activeUploadButtons: false,
      activeUploadAgain: true
    });
  };

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  test = (event) => {
    this.setState({
      uid: null
    }, () => {
      this.setState({activeUploadAgain: false, activeUploadButtons:true})
    });
  }

  render() {
    return (
      <MuiThemeProvider>
      <div>
        <div>
          <div>
            <Paper>
              {this.state.activeUploadButtons?(
                <form
                  encType="multipart/form-data"
                  onSubmit={this.sendFile.bind(this)}
                >
                  <FlatButton
                    label="Upload here CSV file"
                    labelPosition="before"
                    style={styles.uploadButton}
                    containerElement="label"
                  >
                    <input
                      style={styles.uploadInput}
                      name='file'
                      id="uploadFile"
                      type="file"
                    />
                  </FlatButton>

                  <FlatButton
                    label="Process CSV"
                    labelPosition="before"
                    style={styles.uploadButton}
                    containerElement="label"
                  >
                    <input
                      style={styles.uploadInput}
                      type="submit"
                      value="Upload"
                    />
                  </FlatButton>
                </form>
              ) : (
                ""
              )}
              {this.state.activeUploadAgain?(
                   <FlatButton
                    label="Upload file again"
                    onClick={this.test}
                  />
                ) : (
                  ""
                )
              }
            </Paper>
            <Paper style={style} zDepth={1} rounded={false}>
              <Radar
                data={this.state.dataUsage?this.state.dataUsage:{labels: [], datasets: [{data: []}]}}
                options={{
                  scale: {ticks: {min: 0, max: 100}},
                  animation: {duration: 250}
                }}
                width={100}
                height={100}
              />
            </Paper>
            <Paper style={style} zDepth={1} rounded={false}>
              <Radar
                data={this.state.dataFrequency?this.state.dataFrequency:{labels: [], datasets: [{data: []}]}}
                options={{
                  scale: {ticks: {min: 0, max: this.state.maxFrequency}},
                  animation: {duration: 250}
                }}
                width={100}
                height={100}
              />
            </Paper>
          </div>
        </div>
        <div>
          {
            this.state.uid?(
              <Results uid={this.state.uid}
                onEnd={this.uploadAgain}
              />
            ) : (
              ""
            )
          }
        </div>
      </div>
      </MuiThemeProvider>
    );
  }
}


Htop.propTypes = {
    /**
     * How often to query for htop data
     */
    ms: PropTypes.number
}

Htop.defaultProps = {
    ms: 1000
}

export default Htop;
