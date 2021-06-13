import { vec3, quat, mat4 } from 'gl-matrix';
import { v4 as uuidv4 } from 'uuid';
import { Shader, ShaderLocationType } from '../shader/Shader';
import { Light } from '../lighting';
import { Axis } from '../scene/index';

export interface RenderObjectAttributes {
  name: string,
  gl?: any,
  shader?: Shader,
  model?: ModelAttributes,
  material?: MaterialAttributes,
  parent?: Light | RenderObject
}


export interface ModelAttributes {
  uvs?: number[],
  vertices?: number[],
  normals?: number[],
  indices?: number[],
  modelMatrix?: mat4,
  position: vec3,
  scale?: vec3,
  rotation?: quat,
  centroid?: vec3
}

export interface MaterialAttributes {
  ambient?: vec3,
  diffuse?: vec3,
  specular?: vec3,
  shininess?: number,
  opacity?: number,
  diffuseTexture?: any,
  specularTexture?: any
}

export interface BufferAttributes {
  vao: any,
  attributes: {
    [key: string]: any
  },
  indices?: any
}

export class RenderObject {
  public name: string;
  public id: string;
  public model: ModelAttributes;
  public material: MaterialAttributes;
  public shader?: Shader;
  public gl?: any;
  public buffers?: BufferAttributes;
  public parent?: Light | RenderObject;


  constructor(object: RenderObjectAttributes) {
    this.gl = object.gl;
    this.name = object.name;
    this.material = {
      ambient: object.material?.ambient || [0.2, 0.2, 0.2],
      diffuse: object.material?.diffuse || [0.5, 0.5, 0.5],
      specular: object.material?.specular || [0.2, 0.2, 0.2],
      opacity: object.material?.opacity || 1.0,
      shininess: object.material?.shininess || 10.0
    }
    this.model = {
      uvs: [],
      vertices: [],
      normals: [],
      indices: [],
      position: object.model?.position || vec3.create(),
      rotation: object.model?.rotation || quat.create(),
      scale: object.model?.scale || vec3.fromValues(1, 1, 1)
    };
    this.shader = object.shader;
    this.buffers = {
      vao: null,
      attributes: {}
    };
    this.id = uuidv4();
    this.parent = object.parent;
  }

  initIndexBuffer(elementArr: Uint16Array): any {
    let gl = this.gl;
    const indexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER, // The kind of buffer this is
      elementArr, // The data in an Array object
      gl.STATIC_DRAW // We are not going to change this data, so it is static
    );

    return indexBuffer;
  }

  setup() {
    if (!this.gl) {
      throw new Error("GL context must be initialized for this object!");
    }
    console.log("Setup starting");
    this.calculateCentroid();
  }

  rotate(degrees: number, axis: Axis) {
    switch (axis) {
      case Axis.X:
        quat.rotateX(this.model.rotation!, this.model.rotation!, degrees);
        break;
      case Axis.Y:
        quat.rotateY(this.model.rotation!, this.model.rotation!, degrees);
        break;
      case Axis.Z:
        quat.rotateZ(this.model.rotation!, this.model.rotation!, degrees);
        break;
      default:
        console.log(`Axis ${axis} is not correct!`);
        break;
    }
  }

  draw() {
    let gl = this.gl;

    let modelMatrix = mat4.create();
    let negCentroid = vec3.create();

    vec3.negate(negCentroid, this.model.centroid!);
    mat4.translate(modelMatrix, modelMatrix, this.model.position);
    mat4.translate(modelMatrix, modelMatrix, this.model.centroid!);

    let objectRotation = mat4.create();
    mat4.fromQuat(objectRotation, this.model.rotation!);

    mat4.mul(modelMatrix, modelMatrix, objectRotation);
    mat4.translate(modelMatrix, modelMatrix, negCentroid);
    mat4.scale(modelMatrix, modelMatrix, this.model.scale!);

    let normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    this.model.modelMatrix = modelMatrix;

    this.shader!.updateUniforms(
      {
        "material.diffuse": {
          type: ShaderLocationType.VEC3,
          value: this.material.diffuse
        },
        "material.ambient": {
          type: ShaderLocationType.VEC3,
          value: this.material.ambient
        },
        "material.specular": {
          type: ShaderLocationType.VEC3,
          value: this.material.specular
        },
        "material.opacity": {
          type: ShaderLocationType.FLOAT,
          value: this.material.opacity
        },
        "material.shininess": {
          type: ShaderLocationType.FLOAT,
          value: this.material.shininess
        },
        "model": {
          type: ShaderLocationType.MAT4,
          value: modelMatrix
        },
        "normalMatrix": {
          type: ShaderLocationType.MAT4,
          value: normalMatrix
        }
      }
    )

    gl.useProgram(this.shader!.programInfo.program);
    gl.bindVertexArray(this.buffers!.vao);
    gl.drawElements(gl.TRIANGLES, this.model.indices!.length, gl.UNSIGNED_SHORT, 0);
  }

  calculateCentroid() {
    let vertices = this.model.vertices!;
    let center = vec3.create();
    for (let t = 0; t < vertices.length; t += 3) {
      vec3.add(center, center, vec3.fromValues(vertices[t] * this.model.scale![0], vertices[t + 1] * this.model.scale![1], vertices[t + 2] * this.model.scale![2]));
    }
    vec3.scale(center, center, 1 / (vertices.length / 3));

    this.model.centroid = center;
  }

  initPositionAttribute(positionArray: Float32Array) {
    let gl = this.gl;
    // Create a buffer for the positions.
    const positionBuffer = gl.createBuffer();

    // Select the buffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(
      gl.ARRAY_BUFFER, // The kind of buffer this is
      positionArray, // The data in an Array object
      gl.STATIC_DRAW // We are not going to change this data, so it is static
    );

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
      const numComponents = 3; // pull out 3 values per iteration, ie vec3
      const type = gl.FLOAT; // the data in the buffer is 32bit floats
      const normalize = false; // don't normalize between 0 and 1
      const stride = 0; // how many bytes to get from one set of values to the next
      // Set stride to 0 to use type and numComponents above
      const offset = 0; // how many bytes inside the buffer to start from


      // Set the information WebGL needs to read the buffer properly
      gl.vertexAttribPointer(
        this.shader!.programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      // Tell WebGL to use this attribute
      gl.enableVertexAttribArray(
        this.shader!.programInfo.attribLocations.vertexPosition);
    }

    return positionBuffer;
  }

  initNormalAttribute(normalArray: Float32Array) {
    let gl = this.gl;

    // Create a buffer for the positions.
    const normalBuffer = gl.createBuffer();

    // Select the buffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(
      gl.ARRAY_BUFFER, // The kind of buffer this is
      normalArray, // The data in an Array object
      gl.STATIC_DRAW // We are not going to change this data, so it is static
    );

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
      const numComponents = 3; // pull out 4 values per iteration, ie vec3
      const type = gl.FLOAT; // the data in the buffer is 32bit floats
      const normalize = false; // don't normalize between 0 and 1
      const stride = 0; // how many bytes to get from one set of values to the next
      // Set stride to 0 to use type and numComponents above
      const offset = 0; // how many bytes inside the buffer to start from

      // Set the information WebGL needs to read the buffer properly
      gl.vertexAttribPointer(
        this.shader!.programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      // Tell WebGL to use this attribute
      gl.enableVertexAttribArray(
        this.shader!.programInfo.attribLocations.vertexNormal);
    }

    return normalBuffer;
  }

  initTextureCoords(textureCoords: Float32Array) {
    let gl = this.gl;

    if (textureCoords != null && textureCoords.length > 0) {
      // Create a buffer for the positions.
      const textureCoordBuffer = gl.createBuffer();

      // Select the buffer as the one to apply buffer
      // operations to from here out.
      gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

      // Now pass the list of positions into WebGL to build the
      // shape. We do this by creating a Float32Array from the
      // JavaScript array, then use it to fill the current buffer.
      gl.bufferData(
        gl.ARRAY_BUFFER, // The kind of buffer this is
        textureCoords, // The data in an Array object
        gl.STATIC_DRAW // We are not going to change this data, so it is static
      );

      // Tell WebGL how to pull out the positions from the position
      // buffer into the vertexPosition attribute.
      {
        const numComponents = 2;
        const type = gl.FLOAT; // the data in the buffer is 32bit floats
        const normalize = false; // don't normalize between 0 and 1
        const stride = 0; // how many bytes to get from one set of values to the next
        // Set stride to 0 to use type and numComponents above
        const offset = 0; // how many bytes inside the buffer to start from

        // Set the information WebGL needs to read the buffer properly
        gl.vertexAttribPointer(
          this.shader!.programInfo.attribLocations.vertexUV,
          numComponents,
          type,
          normalize,
          stride,
          offset
        );
        // Tell WebGL to use this attribute
        gl.enableVertexAttribArray(
          this.shader!.programInfo.attribLocations.vertexUV);
      }

      return textureCoordBuffer;
    }
  }
}