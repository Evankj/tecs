import { Entity, World } from '../../src/tecs';
import { Apple, AppleEater, Direction, InputHandler, Position, Renderer, Snake, SnakeNode, Speed } from './components';
import { appleEatSystem, inputSystem, renderSystem, snakeHeadMoveSystem, snakeTailMoveSystem, worldToGrid } from './systems';


const WORLD_WIDTH = 800;
const WORLD_HEIGHT = 800;
const GRID_SQUARE_SIZE = 16;


const canvas = document.createElement("canvas");
canvas.width = WORLD_WIDTH;
canvas.height = WORLD_HEIGHT;

document.body.appendChild(canvas);
const ctx = canvas.getContext("2d")!;

export class SnakeWorld extends World {

  private _apple = this.makeApple();
  private _snake = this.makeSnake();

  private _canvas: CanvasRenderingContext2D = canvas.getContext("2d")!;
  public get canvas() {
    return this._canvas;
  }

  private _gridSquareSize = GRID_SQUARE_SIZE;
  public get gridSquareSize() {
    return this._gridSquareSize;
  }

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
    }, GRID_SQUARE_SIZE);
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
    }, GRID_SQUARE_SIZE);
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
    }, GRID_SQUARE_SIZE);
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

let world = new SnakeWorld();

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

