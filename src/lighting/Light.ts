import { mat4, vec3 } from "gl-matrix";
import { v4 as uuidv4 } from 'uuid';
import { RenderObject } from "../geometry";

export interface LightAttributes {
  strength?: number,
  color?: vec3,
  position?: vec3,
  constant?: number,
  linear?: number,
  quadratic?: number,
  type?: LightType,
  name: string,
  parent?: Light | RenderObject
}

export enum LightType {
  POINT,
  DIRECTIONAL
}

export class Light {
  public strength: number;
  public color: vec3;
  public position: vec3;
  public type?: LightType;
  public name: string;
  public id: string;
  public parent?: Light | RenderObject;
  public model: {
    modelMatrix?: mat4
  }

  constructor(props: LightAttributes) {
    this.strength = props.strength || 0.5;
    this.color = props.color || vec3.fromValues(0.5, 0.5, 0.5);
    this.position = props.position || vec3.create();
    this.id = uuidv4();
    this.name = props.name;
    this.parent = props.parent;
    this.model = {
      modelMatrix: mat4.create()
    }
  }
}