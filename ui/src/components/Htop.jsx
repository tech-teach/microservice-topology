import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HtopService from '../services/htop';


class Htop extends Component {

  constructor(props) {
    super(props);
    this.intervalId = null;
    this.state = {
      cpu: null,
    };
  }

  componentDidMount() {
    const htop = new HtopService();
    this.intervalId = setInterval(
      () => htop.get(res => this.setState({cpu: res.body.cpu})),
      this.props.ms,
    );
  }

  componentWillUnmount() {
    console.log('Killign the interval');
    clearInterval(this.intervalId);
  }

  render() {
    return (
        <p>
          {this.state.cpu && this.state.cpu.join(", ")}
        </p>
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
    ms: 750
}

export default Htop;