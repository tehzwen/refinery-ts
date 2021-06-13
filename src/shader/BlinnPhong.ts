import { Shader, ShaderAttributes } from "./Shader";


export class BlinnPhong extends Shader {
  constructor() {
    const props: ShaderAttributes = {
      vertSource:
        `#version 300 es
      in vec3 vertexPosition;
      in vec3 vertexNormal;

      uniform mat4 projection;
      uniform mat4 view;
      uniform mat4 model;
      uniform mat4 normalMatrix;
      uniform vec3 uCameraPosition;

      out vec3 oNormal;
      out vec3 oCamPosition;
      out vec3 oFragPosition;
      out vec3 normalInterp;
      
      void main() {
        // oCamPosition = (view * vec4(uCameraPosition, 1.0)).xyz;
        oCamPosition = uCameraPosition;
        oNormal = normalize((model * vec4(vertexNormal, 1.0)).xyz);
        oFragPosition = (model * vec4(vertexPosition, 1.0)).xyz;
        normalInterp = vec3(normalMatrix * vec4(vertexNormal, 0.0));
        gl_Position = projection * view * model * vec4(vertexPosition, 1.0);
      }
      `,
      fragSource:
        `#version 300 es
      #define MAX_POINT_LIGHTS 20
      precision highp float;

      struct Material {
        vec3 diffuse;
        vec3 ambient;
        vec3 specular;
        float shininess;
        float opacity;
      };

      struct PointLight {
        vec3 position;
        vec3 color;
        float strength;
        float constant;
        float linear;
        float quadratic;
      };

      in vec3 oNormal;
      in vec3 normalInterp;
      in vec3 oCamPosition;
      in vec3 oFragPosition;

      uniform Material material;
      uniform PointLight pointLights[MAX_POINT_LIGHTS];
      uniform int numPointLights;

      out vec4 fragColor;


      vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
        {
           vec3 lightDir = normalize(light.position - fragPos);
           float diff = max(dot(normal, lightDir), 0.0);
           vec3 reflectDir = reflect(lightDir, normal);
           float spec = pow(max(dot(viewDir, reflectDir), 1.0), material.shininess);
           float distance = length(light.position - fragPos);
           float attenuation = light.strength / (light.constant + light.linear * distance + light.quadratic * (distance * distance));
           vec3 ambient = light.color * mix(material.ambient, material.diffuse, 0.6);
           vec3 diffuse = diff * mix(material.diffuse, light.color, 0.2);
           vec3 V = normalize(oCamPosition - oFragPosition);
           vec3 H = normalize(V + lightDir);
           float NDotH = max(dot(H, normal), 0.0);
           float NHPow = pow(NDotH, material.shininess);
           vec3 specular = NHPow * light.color * material.specular;

           specular *= attenuation;
           ambient *= attenuation;
           diffuse *= attenuation;
           return (ambient + diffuse + specular);
        }
      
      void main() {
        vec3 normal = normalize(normalInterp);
        vec3 result = vec3(0,0,0);
        vec3 viewDir = normalize(oCamPosition - oFragPosition);

        for (int i = 0; i < numPointLights; i++) {
           result += CalcPointLight(pointLights[i], normal, oFragPosition, viewDir);
        }

        // fragColor = vec4(result, material.opacity);
        fragColor = vec4(result, 1.0);

      }
      `
    }

    super(props);
  }

  initShaderProgram() {
    super.initShaderProgram();
    this.addAttribute('vertexPosition');
    this.addAttribute('vertexNormal');
    this.addUniform('material.diffuse');
    this.addUniform('material.ambient');
    this.addUniform('material.specular');
    this.addUniform('material.shininess');
    this.addUniform('material.opacity');
    this.addUniform('projection');
    this.addUniform('view');
    this.addUniform('model');
    this.addUniform('normalMatrix');
    this.addUniform('uCameraPosition');
    this.addUniform('numPointLights');
  }
}