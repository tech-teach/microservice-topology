import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HtopService from '../services/htop';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CircularProgress from 'material-ui/CircularProgress';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import _ from 'lodash';


class Htop extends Component {

  constructor(props) {
    super(props);
    this.intervalId = null;
    this.state = {
      cpu: null,
      memory: null
    };
  }

  componentDidMount() {
    const htop = new HtopService();
    this.intervalId = setInterval(
      () => htop.get(res => this.setState(
        {cpu: res.body.cpu, memory: res.body.memory}
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
        <center>
          <p>Used memory: {
            this.state.memory?(this.state.memory.used/1000000).toFixed(0):0
          }/{
            this.state.memory?((
              this.state.memory.free + this.state.memory.used
            )/1000000).toFixed(0):0
          }Mb</p>
          <CircularProgress
            mode="determinate"
            value={this.state.memory?this.state.memory.used:0}
            size={30}
            thickness={3}
            max={
              this.state.memory?
              this.state.memory.free + this.state.memory.used
              :0
            }
          />
        </center>
        <Table showCheckboxes="false">
          <TableHeader>
            <TableRow>
              <TableHeaderColumn>CPU</TableHeaderColumn>
              <TableHeaderColumn>Frequency</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
              {_.map(this.state.cpu, (cpu, id) => (
              <TableRow key={id}>
                <TableRowColumn>
                  <pre>
                    <CircularProgress
                      mode="determinate"
                      value={cpu.percent}
                      size={30}
                      thickness={3}
                      max={100}
                    />
                    {cpu.percent.toFixed(0)}%
                  </pre>
                </TableRowColumn>
                <TableRowColumn>
                  <pre>
                    <CircularProgress
                      mode="determinate"
                      value={cpu.frequency.current}
                      size={30}
                      thickness={3}
                      max={cpu.frequency.max}
                    />
                    {cpu.frequency.current.toFixed(0)}Mhz
                  </pre>
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
