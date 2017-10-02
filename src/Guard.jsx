import React, { Component } from "react";
import { visibleSet } from "./utils";
import { hsluvToHex } from "hsluv";
class Guard extends Component {
  render() {
    let { position, walls, colorIndex } = this.props;
    let [x, y] = position;
    let sm = visibleSet(position, walls);
    let color = hsluvToHex([colorIndex * 70, 100, 70]);
    return (
      <g fill={color}>
        <circle className="Guard" cx={x} cy={y} r="5" />;
        {/* <polygon
          className="GuardSight"
          points={sm}
          stroke={color}
          fill="url(#texture)"
        />; */}
        <polygon className="GuardSight color" points={sm} />;
      </g>
    );
  }
}

export default Guard;
