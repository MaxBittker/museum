// import logo from './logo.svg';
import React, { Component } from "react";
import Floorplan from "./Floorplan";
import Guard from "./Guard";
import { canSee, visibleSet } from "./utils";
import "./App.css";
let walls = [
  [60, 20],
  // [100, 40],
  [100, 80],
  [50, 70],
  [60, 100],
  [20, 80]
  // [(20, 40)]
].map(([x, y]) => [(x + 20) * 4, (y + 1) * 4]);

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
    // let out = walls.filter(p => canSee(guard, walls, p));
    let sm = visibleSet(guard, walls);

    // let sm = canSee(guard, walls, walls[3]);

    // let sightCones = walls.map(p => [
    //   guard
    //   canSee(guard, walls, p)),
    //   p,
    // );
    // console.log(sm);
    return (
      <div className="Playground">
        <svg
          viewBox="0 0 500 500"
          ref="playground"
          onMouseMove={this.moveGuard.bind(this)}
        >
          <Guard position={guard} />
          {/* <Guard position={walls[0]} /> */}
          {sm.map((p, i) => <Guard key={i} position={p} />)}

          <Floorplan points={sm} />

          <Floorplan points={walls} />
        </svg>
      </div>
    );
  }
}

export default MuseumPlayground;
