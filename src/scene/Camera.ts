import { vec3, quat, mat4 } from "gl-matrix";
import { RenderObject } from "../geometry";

export interface CameraProps {
  name: string,
  position?: vec3,
  center?: vec3,
  direction?: vec3,
  rotation?: quat,
  viewMatrix?: mat4
  target?: RenderObject,
  forward?: vec3,
  euler?: vec3
}

export class Camera {
  public position: vec3;
  public rotation: quat;
  public viewMatrix: mat4;
  public center: vec3;
  public direction: vec3;
  public forward: vec3;
  public name: string;
  public gl: any;
  public target?: RenderObject;
  public euler: vec3;

  constructor(gl: any, props: CameraProps) {
    this.gl = gl;
    this.position = props.position || vec3.create();
    this.rotation = props.rotation || quat.create();
    this.viewMatrix = props.viewMatrix || mat4.create();
    this.center = props.center || vec3.create();
    this.direction = props.direction! || this.getDirection();
    this.forward = props.forward || vec3.create(); //might need to initialize this differently
    this.name = props.name;
    this.target = props.target;
    this.euler = props.euler || [0, 0, 0];
  }

  getDirection() {
    let dir = vec3.create();
    vec3.sub(dir, this.position, this.center!);
  }

  forwardVector() {
    let forward: vec3 = vec3.create();
    forward[0] = -this.viewMatrix[2];
    forward[1] = -this.viewMatrix[6];
    forward[2] = -this.viewMatrix[10];
    return forward;
  }

  upVector() {
    let up: vec3 = vec3.create();
    up[0] = -this.viewMatrix[1];
    up[1] = -this.viewMatrix[5];
    up[2] = -this.viewMatrix[9];
    return up;
  }

  rightVector() {
    let right: vec3 = vec3.create();
    right[0] = -this.viewMatrix[0];
    right[1] = -this.viewMatrix[4];
    right[2] = -this.viewMatrix[8];
    return right;
  }

  rotate(rotVec: vec3) {
    this.euler[0] += rotVec[0];
    this.euler[1] += rotVec[1];
    this.euler[2] += rotVec[2];

    quat.fromEuler(this.rotation, this.euler[0], this.euler[1], this.euler[2]);
  }

  translate(translationVector: vec3, moveScale: number) {
    vec3.scale(translationVector, translationVector, moveScale);
    vec3.add(this.position, this.position, translationVector);
    this.rotation[3] = 1;
  }
}