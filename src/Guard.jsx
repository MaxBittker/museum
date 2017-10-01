import React, { Component } from "react";

class Guard extends Component {
  render() {
    let [x, y] = this.props.position;
    return (
      <g>
        <circle className="Guard" cx={x} cy={y} r="5" />;
        <polygon
          className="GuardSight"
          points={this.props.sight}
          fill="url(#texture)"
        />;
        <polygon className="GuardSight color" points={this.props.sight} />;
      </g>
    );
  }
}

export default Guard;
