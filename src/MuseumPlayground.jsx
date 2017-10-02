// import logo from './logo.svg';
import React, { Component } from "react";
import Floorplan from "./Floorplan";
import Guard from "./Guard";
import Pattern from "./Pattern";

import { walls } from "./layouts";
import { canSee, resample } from "./utils";
import "./App.css";

class MuseumPlayground extends Component {
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
    this.samples = resample(walls);
  }

  getDefaultState() {
    return {
      walls,
      guard: [40 * 6.5, 2.5 * 40],
      guards: []
    };
  }

  mouseP(e) {
    let b = this.refs.playground.getBoundingClientRect();
    let p = [e.clientX - b.x, e.clientY - b.y];

    return [...p];
  }

  moveGuard(e) {
    //this is for the hover state
    this.setState({ guard: this.mouseP(e) });
  }

  placeGuard(e) {
    let { guards } = this.state;
    this.setState({ guards: [...guards, this.mouseP(e)] });
  }

  removeGuard() {
    let { guards } = this.state;
    guards.pop();
    this.setState({ guards });
  }

  coverage() {
    let { walls, guard, guards } = this.state;
    let gset = [...guards, guard];
    let seen = this.samples.filter(
      wp => gset.find(g => canSee(g, walls, wp)) === undefined
    );
    return seen;
  }

  render() {
    let { walls, guard, guards } = this.state;
    let uncovered = this.coverage();
    return (
      <div className="Playground">
        <svg
          viewBox="0 0 500 500"
          ref="playground"
          onMouseMove={this.moveGuard.bind(this)}
          onClick={this.placeGuard.bind(this)}
          onMouseLeave={() => this.setState({ guard: [] })}
        >
          <Pattern />

          {[...guards, guard].map((p, i) => (
            <Guard key={i} walls={walls} position={p} colorIndex={i} />
          ))}

          <Floorplan points={walls} />

          {uncovered.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2" fill="red" />
          ))}
        </svg>
        <div className="controls">
          <h2>Guards: {guards.length}</h2>
          <h2>Vertices: {walls.length}</h2>
          <h2>
            Coverage:{" "}
            {(100 * (1 - uncovered.length / this.samples.length)).toFixed(1)}%
          </h2>
          <button onClick={this.removeGuard.bind(this)}>undo</button>
        </div>
      </div>
    );
  }
}

export default MuseumPlayground;
