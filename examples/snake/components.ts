import { Component, Entity } from "../../src/tecs";

export class SnakeNode extends Component {
  next?: SnakeNode;
  entity?: Entity;
}

export class Renderer extends Component {
  colour: string = "blue";
}

export type Input = {
  direction: 'up' | 'down' | 'left' | 'right' | 'none';

};

export class InputHandler extends Component {
  input: Input = {
    direction: 'none'
  };
}

export class Snake extends Component {
  head?: SnakeNode;
  tailTip?: SnakeNode;
}

export class Apple extends Component { };
export class AppleEater extends Component { };


export type Vector2 = {
  x: number,
  y: number,
}


export function vector2Match(v1: Vector2, v2: Vector2): boolean {
  return (v1.x === v2.x && v1.y === v2.y);
}

export class Position extends Component {
  currentPosition: Vector2 = {
    x: 0,
    y: 0,
  };
  previousPosition: Vector2 = {
    x: 0,
    y: 0,
  };
}

export class Direction extends Component {
  x: number = 0;
  y: number = 0;
}

export class Speed extends Component {
  val: number = 100;
}
