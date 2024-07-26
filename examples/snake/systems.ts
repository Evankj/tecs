import { Entity } from "../../src/tecs";
import { SnakeWorld } from "./snake";
import { AppleEater, InputHandler, Position, Renderer, Snake, SnakeNode, Speed, Vector2, vector2Match } from './components';

type System = (world: SnakeWorld, entity: Entity, dt: number) => void;


export function worldToGrid(pos: Vector2, gridSquareSize: number): Vector2 {
  return {
    x: gridSquareSize * Math.floor(pos.x / gridSquareSize),
    y: gridSquareSize * Math.floor(pos.y / gridSquareSize),
  }
}

const isKeyDown = (() => {
  const state: { [key: string]: boolean } = {};

  window.addEventListener('keyup', (e) => state[e.key] = false);
  window.addEventListener('keydown', (e) => state[e.key] = true);

  return (key: string) => state.hasOwnProperty(key) && state[key] || false;
})();

export const inputSystem: System = (_world, entity, _dt) => {
  let input = entity.getComponent(InputHandler);
  if (!input) return;


  if (isKeyDown('ArrowUp')) {
    if (input.input.direction != 'down') {
      input.input.direction = 'up';
    }
  }
  if (isKeyDown('ArrowLeft')) {
    if (input.input.direction != 'right') {
      input.input.direction = 'left';
    }
  }
  if (isKeyDown('ArrowDown')) {
    if (input.input.direction != 'up') {
      input.input.direction = 'down';
    }
  }
  if (isKeyDown('ArrowRight')) {
    if (input.input.direction != 'left') {
      input.input.direction = 'right';
    }
  }
  if (isKeyDown('w')) {
    console.log("PAUSING")
    input.input.direction = 'none';
  }

};


export const snakeHeadMoveSystem: System = (world, entity, dt) => {

  let snake = entity.getComponent(Snake);
  let input = entity.getComponent(InputHandler);
  let pos = entity.getComponent(Position);
  let speed = entity.getComponent(Speed);

  // let [
  //   snake,
  //   input,
  //   pos,
  //   speed
  // ] = entity.getComponents(Snake, InputHandler, Position, Speed)

  if (!snake || !input || !pos || !speed) return;
  speed.val = 5;

  let gridPos = worldToGrid(pos.currentPosition, world.gridSquareSize);
  if (!vector2Match(gridPos, pos.previousPosition)) {
    pos.previousPosition = gridPos;
  }

  switch (input.input.direction) {
    case 'up':
      pos.currentPosition.y -= speed.val * dt;
      break;
    case 'down':
      pos.currentPosition.y += speed.val * dt;
      break;
    case 'left':
      pos.currentPosition.x -= speed.val * dt;
      break;
    case 'right':
      pos.currentPosition.x += speed.val * dt;
      break;
    case 'none':
      break;
  }

}

export const snakeTailMoveSystem: System = (_world, entity, _dt) => {
  let node = entity.getComponent(SnakeNode);
  let pos = entity.getComponent(Position);

  if (!node || !pos) return;

  let next = node.next;
  if (next) {

    if (!next.entity) return;

    let nextPos = next.entity.getComponent(Position);

    if (!nextPos) return;

    if (!vector2Match(nextPos.currentPosition, nextPos.previousPosition)) {
      pos.previousPosition = pos.currentPosition;
      pos.currentPosition = nextPos.previousPosition;
    }
  }
}

export const renderSystem: System = (world, entity, _dt) => {
  let pos = entity?.getComponent(Position);
  let renderer = entity?.getComponent(Renderer);
  if (!renderer || !pos) return;
  let gridPos = worldToGrid(pos.currentPosition, world.gridSquareSize);

  world.canvas.fillStyle = renderer.colour;
  world.canvas.fillRect(gridPos.x, gridPos.y, world.gridSquareSize, world.gridSquareSize);
}

export const appleEatSystem: System = (world, entity, _dt) => {
  let appleEater = entity?.getComponent(AppleEater);
  let pos = entity?.getComponent(Position);

  if (!appleEater || !pos) return;

  let applePos = world.apple.getComponent(Position)!;

  let gridPos = worldToGrid(pos.currentPosition, world.gridSquareSize);
  if (vector2Match(gridPos, applePos.currentPosition)) {
    world.eatApple();
  }

}
