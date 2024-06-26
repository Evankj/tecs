export type ComponentType = string;
export type EntityTag = string | undefined;
export type EntityId = number;

export class Component {
  static type(): ComponentType {
    return this.name;
  }
  public type(): ComponentType {
    return this.constructor.name;
  }
}

export interface Entity {
  get id(): EntityId;
  get tag(): EntityTag;
  getComponent<T extends typeof Component>(type: T): InstanceType<T> | undefined;
  addComponent<T extends typeof Component>(component: InstanceType<T> | T): Entity;
  removeComponent<T extends typeof Component>(type: T): void;
}

class EntityImpl implements Entity {
  private components: Map<ComponentType, Component>;
  private _tag: EntityTag;
  private _id: EntityId;
  public get tag(): EntityTag {
    return this._tag;
  }
  public get id(): EntityId {
    return this._id;
  }
  constructor(id: EntityId, tag?: EntityTag) {
    this._id = id;
    this._tag = tag;
    this.components = new Map();
  }

  public getComponent<T extends typeof Component>(type: T): InstanceType<T> | undefined {

    let comp = this.components.get(type.type());

    if (!comp) {
      return undefined;
    }

    return comp as InstanceType<T>;
  }

  public addComponent<T extends typeof Component>(component: InstanceType<T> | T): typeof this {

    let value: InstanceType<T>;

    if (component instanceof Component) {
      value = component;
    } else {
      value = (new (component as T)()) as InstanceType<T>;
    }

    this.components.set(component.type(), value);

    return this;
  }

  public removeComponent<T extends typeof Component>(type: T) {
    this.components.delete(type.type());
  }
}

export class World {
  private _entities: (Entity | undefined)[] = [];
  private _freeIndexes: number[] = [];

  public get entities() {
    return this._entities;
  }

  public createEntity(tag?: string): Entity {

    let index = this._freeIndexes.pop();
    let entity = new EntityImpl(index || this.entities.length, tag);
    if (index) {
      this._entities[index] = entity;
    } else {
      this._entities.push(entity);
    }

    return entity;
  }

  public deleteEntity(index: number) {
    if (index >= 0 && index < this._entities.length) {
      this._entities[index] = undefined;
      this._freeIndexes.push(index);
    }
  }

}




















