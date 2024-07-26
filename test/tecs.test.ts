import { Component, World } from '../src/tecs';
import { expect, test } from 'bun:test'


test('Create entity', () => {
  const world = new World();
  world.createEntity();
  expect(world.entities.length).toBe(1);
});



test('Delete entity', () => {
  const world = new World();
  const entity = world.createEntity();
  world.deleteEntity(entity.id);
  expect(world.entityCount).toBe(0);
});


test('Add component to entity', () => {
  class TestComponent extends Component {
    value: number;
  }

  const world = new World();
  const entity = world.createEntity();
  entity.addComponent(TestComponent);
  const component = entity.getComponent(TestComponent);
  component!.value = 1;
  expect(component!.value).toBe(1);
});
