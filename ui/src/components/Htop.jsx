import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HtopService from '../services/htop';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import _ from 'lodash';
import {Radar} from 'react-chartjs-2';
import Paper from 'material-ui/Paper';

const style = {
  height: 300,
  width: 300,
  margin: 10,
  textAlign: 'center',
  display: 'inline-block',
};

class Htop extends Component {

  constructor(props) {
    super(props);
    this.intervalId = null;
    this.state = {
      cpu: null,
      memory: null,
      data_usage: null,
      data_frequency: null,
      max_frequency: 0
    };
  }

  componentDidMount() {
    const htop = new HtopService();
    this.intervalId = setInterval(
      () => htop.get(res => this.setState(
        {
          cpu: res.body.cpu,
          memory: res.body.memory,
          data_usage: {
            labels: _.range(res.body.cpu.length),
            datasets: [{
              label: 'CPU Usage',
              backgroundColor: 'rgba(255,99,132,0.2)',
              borderColor: 'rgba(255,99,132,1)',
              pointBackgroundColor: 'rgba(255,99,132,0.5)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(255,99,132,1)',
              data: res.body.cpu.map((cpu) => cpu.percent)
            }]
          },
          data_frequency: {
            labels: _.range(res.body.cpu.length),
            datasets: [{
              label: 'CPU Frequency',
              backgroundColor: 'rgba(255,99,132,0.2)',
              borderColor: 'rgba(255,99,132,1)',
              pointBackgroundColor: 'rgba(255,99,132,0.5)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(255,99,132,1)',
              data: res.body.cpu.map((cpu) => cpu.frequency.current)
            }]
          },
          max_frequency: res.body.cpu[0].frequency.max
        },
      )),
      this.props.ms,
    );
  }

  componentWillUnmount() {
    console.log('Killign the interval');
    clearInterval(this.intervalId);
  }
  render() {
    return (
      <MuiThemeProvider>
      <div>
      <Paper style={style} zDepth={1} rounded={false}>
        <Radar
          data={this.state.data_usage?this.state.data_usage:{labels: [], datasets: [{data: []}]}}
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
          data={this.state.data_frequency?this.state.data_frequency:{labels: [], datasets: [{data: []}]}}
          options={{
            scale: {ticks: {min: 0, max: this.state.max_frequency}},
            animation: {duration: 250}
          }}
          width={100}
          height={100}
        />
      </Paper>
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
