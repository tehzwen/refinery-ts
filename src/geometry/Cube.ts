import { RenderObject, RenderObjectAttributes } from "./RenderObject";


export class Cube extends RenderObject {
  constructor(object: RenderObjectAttributes) {
    super(object);

    this.model.vertices = [
      0.0, 0.0, 0.0,
      0.0, 0.5, 0.0,
      0.5, 0.5, 0.0,
      0.5, 0.0, 0.0,

      0.0, 0.0, 0.5,
      0.0, 0.5, 0.5,
      0.5, 0.5, 0.5,
      0.5, 0.0, 0.5,

      0.0, 0.5, 0.5,
      0.0, 0.5, 0.0,
      0.5, 0.5, 0.0,
      0.5, 0.5, 0.5,

      0.0, 0.0, 0.5,
      0.5, 0.0, 0.5,
      0.5, 0.0, 0.0,
      0.0, 0.0, 0.0,

      0.5, 0.0, 0.5,
      0.5, 0.0, 0.0,
      0.5, 0.5, 0.5,
      0.5, 0.5, 0.0,

      0.0, 0.0, 0.5,
      0.0, 0.0, 0.0,
      0.0, 0.5, 0.5,
      0.0, 0.5, 0.0
    ];

    this.model.uvs = [
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0
    ];

    this.model.indices = [
      2, 0, 1, 3, 0, 2,
      5, 4, 6, 6, 4, 7,
      10, 9, 8, 10, 8, 11,
      13, 12, 14, 14, 12, 15,
      18, 16, 17, 18, 17, 19,
      22, 21, 20, 23, 21, 22,
    ];

    this.model.normals = [
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,
      0.0, 0.0, -1.0,

      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,

      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,

      0.0, -1.0, 0.0,
      0.0, -1.0, 0.0,
      0.0, -1.0, 0.0,
      0.0, -1.0, 0.0,

      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,

      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0
    ];

  }

  setup() {
    super.setup();
    console.log("Now setting up the cube!");
    this.initBuffers();
  }

  initBuffers() {
    let gl = this.gl;

    const positions = new Float32Array(this.model.vertices!);
    const normals = new Float32Array(this.model.normals!);
    const indices = new Uint16Array(this.model.indices!);
    const uvs = new Float32Array(this.model.uvs!);


    let vertexArrayObject = gl.createVertexArray();
    gl.bindVertexArray(vertexArrayObject);

    this.buffers = {
      vao: vertexArrayObject,
      attributes: {
        position: this.shader!.programInfo.attribLocations.vertexPosition != null ? this.initPositionAttribute(positions) : null,
        normal: this.shader!.programInfo.attribLocations.vertexNormal != null ? this.initNormalAttribute(normals) : null,
        uv: this.shader!.programInfo.attribLocations.vertexUV != null ? this.initTextureCoords(uvs) : null,
      },
      indices: this.initIndexBuffer(indices),
    }
  }
}