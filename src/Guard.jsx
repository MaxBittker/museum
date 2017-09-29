import React, { Component } from "react";

class Guard extends Component {
  render() {
    let [x, y] = this.props.position;
    return <circle className="Guard" cx={x} cy={y} r="5" />;
  }
}

export default Guard;
