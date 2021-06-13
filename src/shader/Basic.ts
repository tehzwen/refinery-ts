import { Shader, ShaderAttributes } from "./Shader";


export class Basic extends Shader {
  constructor() {
    const props: ShaderAttributes = {
      vertSource: 
      `#version 300 es
      in vec3 vertexPosition;
      
      void main() {
        gl_Position = vec4(vertexPosition, 1.0);
      }
      `,
      fragSource: 
      `#version 300 es
      #define MAX_LIGHTS 20
      precision highp float;

      struct Material {
        vec3 diffuse;
      };

      uniform Material material;

      out vec4 fragColor;
      
      void main() {
        fragColor = vec4(material.diffuse, 1.0);
      }
      `
    }

    super(props);    
  }

  initShaderProgram() {
    super.initShaderProgram();
    this.addAttribute('vertexPosition');
    this.addUniform('material.diffuse');
  }
}