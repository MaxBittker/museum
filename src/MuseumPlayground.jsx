// import logo from './logo.svg';
import React, { Component } from "react";
import Floorplan from "./Floorplan";
import Guard from "./Guard";
import { visibleSet, canSee } from "./utils";
import { walls } from "./layouts";

import "./App.css";

class MuseumPlayground extends Component {
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
  }
  getDefaultState() {
    return {
      walls,
      guard: [260, 190]
    };
  }
  moveGuard(e) {
    let b = this.refs.playground.getBoundingClientRect();
    let p = [e.clientX - b.x, e.clientY - b.y];
    this.setState({ guard: p });
  }

  render() {
    let { walls, guard } = this.state;
    let out = walls.filter(p => canSee(guard, walls, p));
    let sm = visibleSet(guard, walls);
    // let sm = canSee(guard, walls, walls[3]);

    return (
      <div className="Playground">
        <svg
          viewBox="0 0 500 500"
          ref="playground"
          onMouseMove={this.moveGuard.bind(this)}
        >
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

              {/* <image xlinkHref="nnt.png" x="0" y="0" width="100" height="100" /> */}
            </pattern>
          </defs>
          <Guard position={guard} sight={sm} />
          {/* <Guard position={walls[0]} /> */}
          {out.map((p, i) => <Guard key={i} position={p} />)}
          {/* <Floorplan points={sm} /> */}

          <Floorplan points={walls} />
        </svg>
      </div>
    );
  }
}

export default MuseumPlayground;
