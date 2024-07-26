export type ComponentType = string;
export type EntityTag = string | undefined;
export type EntityId = number;

// This interface just exists so we can reuse the encoder
export interface ComponentSerialiser {
  serialise(component: Component): Uint8Array;
  deserialise<T extends Component>(data: Uint8Array): T;
}

export class Component {

  static type(): ComponentType {
    return this.name;
  }

  public type(): ComponentType {
    return this.constructor.name;
  }

  public serialise(serialiser: ComponentSerialiser): Uint8Array {
    return serialiser.serialise(this);
  }

  static deserialise<T extends Component>(this: new () => T, data: Uint8Array): T {
    const jsonString = new TextDecoder().decode(data);
    const jsonObject = JSON.parse(jsonString);

    const instance = new this() as T;
    Object.assign(instance, jsonObject);

    return instance;
  }
}

class Test extends Component { }

let c: Test;

let s: ComponentSerialiser;

let d = Test.deserialise(s, c.serialise(s));

export interface Entity {
  get id(): EntityId;
  get tag(): EntityTag;
  getComponent<T extends typeof Component>(type: T): InstanceType<T> | undefined;
  getComponents<T extends typeof Component[]>(...types: T): {
    [K in keyof T]: InstanceType<T[K]> | undefined
  };
  addComponent<T extends typeof Component>(component: InstanceType<T> | T): Entity;
  removeComponent<T extends typeof Component>(type: T): void;
}

class EntityImpl implements Entity {
  private components: Record<ComponentType, Component | undefined>;
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
    this.components = {};
  }

  public getComponent<T extends typeof Component>(type: T): InstanceType<T> | undefined {

    let comp = this.components[type.type()];

    if (!comp) {
      return undefined;
    }

    return comp as InstanceType<T>;
  }

  public getComponents<T extends (typeof Component)[]>(...types: T): { [K in keyof T]: InstanceType<T[K]> | undefined; } {

    let components: { [K in keyof T]: InstanceType<T[K]> | undefined; } = {} as any; // gross hack, but it works
    for (const component of types) {
      components.push(this.getComponent(component))
    }

    return components;
  }

  public addComponent<T extends typeof Component>(component: InstanceType<T> | T): typeof this {

    let value: InstanceType<T>;

    if (component instanceof Component) {
      value = component;
    } else {
      value = (new (component as T)()) as InstanceType<T>;
    }

    this.components[component.type()] = value;

    return this;
  }

  public removeComponent<T extends typeof Component>(type: T) {
    this.components[type.type()] = undefined;
  }
}

export class World {
  private _entities: (Entity | undefined)[] = [];
  private _freeIndexes: number[] = [];

  public get entities() {
    return this._entities;
  }

  public get entityCount(): number {
    return this._entities.length - this._freeIndexes.length;
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
