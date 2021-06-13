export interface ShaderAttributes {
  vertSource: string,
  fragSource: string,
  geoSource?: string
}

export interface ShaderProgramInfo {
  program: any,
  attribLocations: ShaderLocations
  uniformLocations: ShaderLocations
}

export enum ShaderLocationType {
  MAT4,
  MAT3,
  VEC3, 
  INT, 
  FLOAT, 
  VEC3_ARRAY
}

export interface ShaderLocations {
    [key: string]: {
      type: ShaderLocationType 
      value: any
    }
}


export class Shader {
  public programInfo: ShaderProgramInfo;
  public gl?: any;
  public props: ShaderAttributes;

  constructor(props: ShaderAttributes) {
    this.props = props;
    this.programInfo = {
      program: null,
      attribLocations: {},
      uniformLocations: {}
    }
  }

  // helper for loading from glsl file. Note: must contain @fragment and @vertex indicators


  initShaderProgram() {

    if (!this.gl) {
      throw new Error("this.gl is not yet defined in the shader!");
    }

    let gl = this.gl;
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, this.props.vertSource);
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, this.props.fragSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    if (this.props.geoSource) {
      const geoShader = this.loadShader(gl.GEOMETRY_SHADER, this.props.geoSource);
      gl.attachShader(shaderProgram, geoShader);
    }

    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error('Unable to link the shader program' + gl.getProgramInfoLog(shaderProgram));
    }

    this.programInfo.program = shaderProgram;
  }

  addAttributes(attribs: string[]) {
      attribs.forEach((attrib) => {
        this.addAttribute(attrib);
      });
  }

  addAttribute(attribute: string) {
    this.programInfo.attribLocations[attribute] = this.gl.getAttribLocation(this.programInfo.program, attribute);
  }

  addUniforms(uniforms: string[]) {
    uniforms.forEach((uniform) => {
      this.addUniform(uniform);
    });
}

  addUniform(uniform: string) {
    this.programInfo.uniformLocations[uniform] = this.gl.getUniformLocation(this.programInfo.program, uniform);
  }

  updateUniforms(values: ShaderLocations) {
    let gl = this.gl;

    Object.keys(values).forEach((key) => {
      let location = values[key];

      switch(location.type) {
        case ShaderLocationType.FLOAT:
          gl.uniform1f(this.programInfo.uniformLocations[key], location.value);
          break;
        case ShaderLocationType.INT:
          gl.uniform1i(this.programInfo.uniformLocations[key], location.value);
          break;
        case ShaderLocationType.MAT4:
          gl.uniformMatrix4fv(this.programInfo.uniformLocations[key], false, location.value);
          break;
        case ShaderLocationType.VEC3:
          gl.uniform3fv(this.programInfo.uniformLocations[key], location.value);
          break;
        default:
          console.log(`Type ${location.type} is not supported yet!`);
      }
    });
  }

  loadShader = (type: number, source: string) => {
    let gl = this.gl;
    const tempShader = gl.createShader(type);

    gl.shaderSource(tempShader, source);
    gl.compileShader(tempShader);

    if (!gl.getShaderParameter(tempShader, gl.COMPILE_STATUS)) {
      // Fail with an error message
      let typeStr = '';
      if (type === gl.VERTEX_SHADER) {
        typeStr = 'VERTEX';
      } else if (type === gl.FRAGMENT_SHADER) {
        typeStr = 'FRAGMENT';
      }
      gl.deleteShader(tempShader);
      throw new Error('An error occurred compiling the shader: ' + typeStr + gl.getShaderInfoLog(tempShader))
    }

    return tempShader;
  }
}