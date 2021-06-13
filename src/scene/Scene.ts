import { mat4, vec4, vec3 } from "gl-matrix";
import { RenderObject } from "../geometry";
import { Light, LightType, PointLight } from "../lighting";
import { Shader } from "../shader";
import { Camera, CameraProps } from "./Camera";

export interface SceneSettings {
  culling: {
    enabled: boolean,
    frontFace?: any,
    cullFace?: any
  },
  background: vec4,
  projectionMatrix: mat4,
  clear: any,
  clearDepth: number,
  depth: {
    enabled: boolean,
    func: any
  },
  fieldOfView: number,
  near: number,
  far: number
}

interface SceneProps {
  width: number,
  height: number,
  camera?: Camera
}

export class Scene {
  public gl: any;
  public settings: SceneSettings;
  public objects: {
    [key: string]: RenderObject
  }
  public props: SceneProps;
  public camera: Camera;
  public lights: Light[];


  constructor(gl: any, props: SceneProps) {
    this.gl = gl;
    this.objects = {};
    this.props = props;
    this.lights = [];

    this.camera = props.camera || new Camera(gl, { name: 'main-camera' });

    this.settings = {
      culling: {
        enabled: true,
        frontFace: gl.CCW,
        cullFace: gl.BACK
      },
      background: vec4.fromValues(0.0, 0.0, 0.0, 1.0),
      projectionMatrix: mat4.create(),
      clear: gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
      clearDepth: 1.0,
      depth: {
        enabled: true,
        func: gl.LEQUAL
      },
      fieldOfView: 60.0,
      near: 0.1,
      far: 1000
    }
  }

  addShader(shader: Shader) {
    shader.gl = this.gl;
    shader.initShaderProgram()
  }

  addCamera(cameraProps: CameraProps) {
    this.camera = new Camera(this.gl, cameraProps);
  }

  addLight(light: Light) {
    this.lights.push(light);
  }

  removeLight(id: string) {
    this.lights = this.lights.filter((value) => {
      value.id != id;
    });
  }

  addObject(object: RenderObject) {
    if (!this.objects[object.name]) {
      object.gl = this.gl;
      object.setup();
      this.objects[object.name] = object;
    } else {
      throw new Error(`A render object with the name of ${object.name} already exists`);
    }
  }

  getObject(name: string): RenderObject {
    if (this.objects[name]) {
      return this.objects[name];
    }
    throw new Error(`A render object with the name of ${name} does not exist`);
  }

  setBackground(color: vec4) {
    this.settings.background = color;
  }

  draw() {
    let gl = this.gl;

    gl.clearColor(
      this.settings.background[0],
      this.settings.background[1],
      this.settings.background[2],
      this.settings.background[3]
    );
    gl.clearDepth(this.settings.clearDepth);
    gl.clear(this.settings.clear);

    if (this.settings.depth.enabled) {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(this.settings.depth.func);
    }

    if (this.settings.culling.enabled) {
      gl.cullFace(this.settings.culling.cullFace);
      gl.frontFace(this.settings.culling.frontFace);
    }

    let aspect: number = this.props.width / this.props.height;
    let fovy = this.settings.fieldOfView * Math.PI / 180.0;

    mat4.perspective(
      this.settings.projectionMatrix,
      fovy,
      aspect,
      this.settings.near,
      this.settings.far
    );

    let cameraRotation = mat4.create();
    mat4.fromQuat(cameraRotation, this.camera.rotation!);

    let negativeCamPosition = vec3.create();
    vec3.negate(negativeCamPosition, this.camera.position);
    vec3.transformQuat(negativeCamPosition, negativeCamPosition, this.camera.rotation);
    this.camera.viewMatrix = mat4.create();

    // mat4.mul(this.camera.viewMatrix, this.camera.viewMatrix, cameraRotation);
    mat4.translate(this.camera.viewMatrix, this.camera.viewMatrix, negativeCamPosition);
    // let forward = vec3.create();
    // vec3.sub(forward, this.camera.position, this.camera.forwardVector());
    // vec3.transformQuat(forward, forward, this.camera.rotation);

    // mat4.lookAt(this.camera.viewMatrix, this.camera.position, forward, this.camera.upVector());

    Object.keys(this.objects).forEach((key: string) => {
      let object = this.objects[key];
      gl.useProgram(object.shader!.programInfo.program);

      gl.uniformMatrix4fv(
        object.shader!.programInfo.uniformLocations.projection,
        false,
        this.settings.projectionMatrix
      );

      gl.uniformMatrix4fv(
        object.shader!.programInfo.uniformLocations.view,
        false,
        this.camera.viewMatrix
      );

      // uCameraPosition
      gl.uniform3fv(
        object.shader!.programInfo.uniformLocations.uCameraPosition,
        this.camera.position
      );

      // update lights
      let numPointLights = 0;
      this.lights.forEach((light, index) => {
        switch (light.type) {
          case LightType.POINT:
            let pL = light as PointLight;

            let tempLightPosition = vec4.fromValues(pL.position[0], pL.position[1], pL.position[2], 1.0);

            if (pL.parent) {
              let parent = this.getObject(pL.parent.name);
              if (parent!.model && parent!.model.modelMatrix) {
                vec4.transformMat4(tempLightPosition, tempLightPosition, parent!.model.modelMatrix);
              }
            }

            let tempLightPositionVec3 = vec3.fromValues(tempLightPosition[0], tempLightPosition[1], tempLightPosition[2]);

            mat4.translate(pL.model.modelMatrix!, pL.model.modelMatrix!, tempLightPositionVec3);

            gl.uniform3fv(gl.getUniformLocation(object.shader!.programInfo.program, "pointLights[" + index + "].position"), tempLightPositionVec3);
            gl.uniform3fv(gl.getUniformLocation(object.shader!.programInfo.program, "pointLights[" + index + "].color"), pL.color);
            gl.uniform1f(gl.getUniformLocation(object.shader!.programInfo.program, "pointLights[" + index + "].strength"), pL.strength);
            gl.uniform1f(gl.getUniformLocation(object.shader!.programInfo.program, "pointLights[" + index + "].constant"), pL.constant);
            gl.uniform1f(gl.getUniformLocation(object.shader!.programInfo.program, "pointLights[" + index + "].linear"), pL.linear);
            gl.uniform1f(gl.getUniformLocation(object.shader!.programInfo.program, "pointLights[" + index + "].quadratic"), pL.quadratic);
            numPointLights++;
            break;
          default:
            console.error("This type does not exist");
        }
      });
      gl.uniform1i(object.shader!.programInfo.uniformLocations.numPointLights, numPointLights);

      object.draw();
    });
  }
}