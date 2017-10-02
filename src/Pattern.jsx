import React, { Component } from "react";

class Pattern extends Component {
  render() {
    return (
      <defs>
        <pattern
          id="texture"
          patternUnits="userSpaceOnUse"
          width="256"
          height="256"
        >
          <image
            xlinkHref="https://www.transparenttextures.com/patterns/cardboard-flat.png"
            x="0"
            y="0"
          />
        </pattern>
      </defs>
    );
  }
}

export default Pattern;
