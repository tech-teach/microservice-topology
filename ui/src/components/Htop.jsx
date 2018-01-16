import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Radar } from 'react-chartjs-2';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import SelectField from 'material-ui/SelectField';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import _ from 'lodash';

import Results from './Results'

import CoreCountService from '../services/cpu'
import HtopService from '../services/htop';
import TaskService from '../services/task';

const coreCountService = new CoreCountService();
const htopService = new HtopService();
const taskService =  new TaskService();

const style = {
  height: 300,
  width: 300,
  margin: 20,
  textAlign: 'center',
  display: 'inline-block',
  padding: 20,
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
      coreCount: 1,
      selectedCores: 1,
      selectedLanguage: "Python",
      fileName: null
    };
  }

  sendFile(event) {
    const file = event.target.file.files[0];
    this.setState({fileName: file.name});
    taskService.post(file, this.state.selectedCores, this.state.selectedLanguage, res => (
        this.setState(
          { uid: res.body.uid, activeUploadButtons: false }
        )
    ));
    event.preventDefault();
  }

  componentDidMount() {
    coreCountService.get(res => this.setState(
        {coreCount: res.body.coreCount, selectedCores: res.body.coreCount}
    ));

    this.intervalId = setInterval(
      () => htopService.get(res => this.setState(
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
      this.setState({ activeUploadAgain: false, activeUploadButtons: true })
    });
  }

  handleChangeCoreCount(event, index, coreCount) {
    this.setState({selectedCores: coreCount});
  }
  handleChangeLanguage(event, index, language) {
    this.setState({selectedLanguage: language});
  }

  render() {
    return (
      <MuiThemeProvider>
        <div>
          <div>
            <div>
              <Paper>
                {this.state.activeUploadButtons ? (
                  <form
                    encType="multipart/form-data"
                    onSubmit={this.sendFile.bind(this)}
                    id="fileForm"
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

                    <SelectField
                      style={styles.uploadButton}
                      value={this.state.selectedCores}
                      onChange={this.handleChangeCoreCount.bind(this)}
                    >
                      {_.map(_.range(0, this.state.coreCount), (i, id) => (
                        <MenuItem
                          value={i + 1}
                          key={id}
                          primaryText={`${i + 1} Cores`}
                        />
                      ))}
                    </SelectField>

                    <SelectField
                      style={styles.uploadButton}
                      value={this.state.selectedLanguage}
                      onChange={this.handleChangeLanguage.bind(this)}
                    >
                      {_.map(["Python", "C"], (lan, id) => (
                        <MenuItem
                          value={lan}
                          key={id}
                          primaryText={lan}
                        />
                      ))}
                    </SelectField>

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
                {this.state.activeUploadAgain ? (
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
                  data={this.state.dataUsage ? this.state.dataUsage : { labels: [], datasets: [{ data: [] }] }}
                  options={{
                    scale: { ticks: { min: 0, max: 100 } },
                    animation: { duration: 250 }
                  }}
                  width={100}
                  height={100}
                />
              </Paper>
              <Paper style={style} zDepth={1} rounded={false}>
                <Radar
                  data={this.state.dataFrequency ? this.state.dataFrequency : { labels: [], datasets: [{ data: [] }] }}
                  options={{
                    scale: { ticks: { min: 0, max: this.state.maxFrequency } },
                    animation: { duration: 250 }
                  }}
                  width={100}
                  height={100}
                />
              </Paper>
            </div>
          </div>
          <div>
            {
              this.state.uid ? (
                <Results uid={this.state.uid}
                  onEnd={this.uploadAgain}
                  language={this.state.selectedLanguage}
                  fileName={this.state.fileName}
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
