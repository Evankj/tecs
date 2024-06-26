import { Component, Entity, World } from './tecs';


const WORLD_WIDTH = 800;
const WORLD_HEIGHT = 800;
const GRID_SQUARE_SIZE = 16;


const canvas = document.createElement("canvas");
canvas.width = WORLD_WIDTH;
canvas.height = WORLD_HEIGHT;

document.body.appendChild(canvas);
const ctx = canvas.getContext("2d")!;


type Vector2 = {
  x: number,
  y: number,
}


function vector2Match(v1: Vector2, v2: Vector2): boolean {
  return (v1.x === v2.x && v1.y === v2.y);
}

function worldToGrid(pos: Vector2): Vector2 {
  return {
    x: GRID_SQUARE_SIZE * Math.floor(pos.x / GRID_SQUARE_SIZE),
    y: GRID_SQUARE_SIZE * Math.floor(pos.y / GRID_SQUARE_SIZE),
  }
}

class SnakeNode extends Component {
  next?: SnakeNode;
  entity?: Entity;
}

class Renderer extends Component {
  colour: string = "blue";
}

type Input = {
  direction: 'up' | 'down' | 'left' | 'right' | 'none';

};

class InputHandler extends Component {
  input: Input = {
    direction: 'none'
  };
}

class Snake extends Component {
  head?: SnakeNode;
  tailTip?: SnakeNode;
}

class Apple extends Component { };
class AppleEater extends Component { };

class Position extends Component {
  currentPosition: Vector2 = {
    x: 0,
    y: 0,
  };
  previousPosition: Vector2 = {
    x: 0,
    y: 0,
  };
}

class Direction extends Component {
  x: number = 0;
  y: number = 0;
}

class Speed extends Component {
  val: number = 100;
}


const isKeyDown = (() => {
  const state: { [key: string]: boolean } = {};

  window.addEventListener('keyup', (e) => state[e.key] = false);
  window.addEventListener('keydown', (e) => state[e.key] = true);

  return (key: string) => state.hasOwnProperty(key) && state[key] || false;
})();

class SnakeWorld extends World {

  private _apple = this.makeApple();
  private _snake = this.makeSnake();

  public score = 0;

  public get apple() {
    return this._apple;
  }

  public get snake() {
    return this._snake;
  }

  public eatApple() {
    this.score++;
    this.apple.getComponent(Position)!.currentPosition = worldToGrid({
      x: Math.random() * (WORLD_WIDTH - GRID_SQUARE_SIZE),
      y: Math.random() * (WORLD_HEIGHT - GRID_SQUARE_SIZE),
    });
    let snake = this.snake.getComponent(Snake);

    let snakeTail = this.createEntity();

    let snakeTailNode = new SnakeNode();
    snakeTailNode.next = snake?.tailTip;
    snakeTailNode.entity = snakeTail;
    snake!.tailTip = snakeTailNode;

    snakeTail.addComponent(snakeTailNode).
      addComponent(Position).
      addComponent(Renderer);
  }

  public makeApple(): Entity {
    let appleEntity = this.createEntity();
    appleEntity.addComponent(Apple);

    let applePos = new Position();
    applePos.currentPosition = worldToGrid({
      x: Math.random() * (WORLD_WIDTH - GRID_SQUARE_SIZE),
      y: Math.random() * (WORLD_HEIGHT - GRID_SQUARE_SIZE),
    });
    appleEntity.addComponent(applePos);

    let appleRenderer = new Renderer();


    appleRenderer.colour = "red";
    appleEntity.addComponent(appleRenderer);

    return appleEntity;
  }

  public makeSnake(): Entity {
    let snakeEntity = this.createEntity();
    snakeEntity.
      addComponent(Direction).
      addComponent(AppleEater).
      addComponent(InputHandler);

    let snakeHeadRenderer = new Renderer();
    snakeHeadRenderer.colour = 'green';
    snakeEntity.addComponent(snakeHeadRenderer);

    let snakePosition = new Position();
    snakePosition.currentPosition = worldToGrid({
      x: 0,
      y: 0,
    });
    snakePosition.previousPosition = snakePosition.currentPosition;
    snakeEntity.addComponent(snakePosition);

    let snakeSpeed = new Speed();
    snakeSpeed.val = 20;
    snakeEntity.addComponent(snakeSpeed);

    let snakeHead = new SnakeNode();
    snakeHead.entity = snakeEntity;
    snakeEntity.addComponent(snakeHead);

    let snakeData = new Snake();
    snakeData.head = snakeHead;
    snakeData.tailTip = snakeHead;
    snakeEntity.addComponent(snakeData);

    return snakeEntity;
  }

}

type System = (world: SnakeWorld, entity: Entity, dt: number) => void;

let world = new SnakeWorld();



const inputSystem: System = (_world, entity, _dt) => {
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

const snakeHeadMoveSystem: System = (_world, entity, dt) => {

  let snake = entity.getComponent(Snake);
  let input = entity.getComponent(InputHandler);
  let pos = entity.getComponent(Position);
  let speed = entity.getComponent(Speed);

  if (!snake || !input || !pos || !speed) return;

  let gridPos = worldToGrid(pos.currentPosition);
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

const snakeTailMoveSystem: System = (_world, entity, _dt) => {
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

const renderSystem: System = (_world, entity, _dt) => {
  let pos = entity?.getComponent(Position);
  let renderer = entity?.getComponent(Renderer);
  if (!renderer || !pos) return;
  let gridPos = worldToGrid(pos.currentPosition);

  ctx.fillStyle = renderer.colour;
  ctx.fillRect(gridPos.x, gridPos.y, GRID_SQUARE_SIZE, GRID_SQUARE_SIZE);
}

const appleEatSystem: System = (world, entity, _dt) => {
  let appleEater = entity?.getComponent(AppleEater);
  let pos = entity?.getComponent(Position);

  if (!appleEater || !pos) return;

  let applePos = world.apple.getComponent(Position)!;

  let gridPos = worldToGrid(pos.currentPosition);
  if (vector2Match(gridPos, applePos.currentPosition)) {
    world.eatApple();
  }

}



const fps = 60;
const fpsInterval = 1000 / fps;
let then = performance.now();

function gameLoop() {
  requestAnimationFrame(gameLoop);

  const now = performance.now();
  const elapsed = (now - then);

  if (elapsed >= fpsInterval) {
    then = now - (elapsed % fpsInterval);

    let dt = elapsed / 100;
    let fps = 1000 / elapsed;

    ctx.reset()

    for (const entity of world.entities) {
      if (entity) {
        inputSystem(world, entity, dt);
        snakeHeadMoveSystem(world, entity, dt);
        snakeTailMoveSystem(world, entity, dt);
        appleEatSystem(world, entity, dt);
        renderSystem(world, entity, dt);
      }
    }

    ctx.fillStyle = "red";
    ctx.font = "48px Fira Sans";
    ctx.fillText(`FPS: ${fps.toFixed(0)} --- SCORE: ${world.score}`, 10, 50);
  }
}


gameLoop();

