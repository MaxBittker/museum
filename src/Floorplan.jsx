import React, { Component } from "react";

class Floorplan extends Component {
  render() {
    return (
      <polygon
        className="Floorplan"
        points={this.props.points}
        fill="url(#texture)"
      />
    );
  }
}

export default Floorplan;
