import React, { Component } from "react";

// function pointsStr
class Floorplan extends Component {
  // constructor(props) {
  // super(props);
  // this.state = this.getDefaultState();
  // }

  render() {
    return <polygon className="Floorplan" points={this.props.points} />;
  }
}

export default Floorplan;
