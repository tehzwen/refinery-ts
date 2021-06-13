import fetch from 'node-fetch';
import { Shader, ShaderLocationType } from "./Shader";
import { Basic } from './Basic';
import { BlinnPhong } from "./BlinnPhong";
import { Custom } from './Custom';


export interface ShaderFileOutput {
  fragSource: string,
  vertSource: string,
  geoSource: string,
  attributes: string[],
  uniforms: string[]
}

const loadFromFile = (file: string) => {
  return new Promise((resolve, reject) => {
    fetch(file)
      .then((res: any) => {
        return res.text();
      })
      .then((data: any) => {
        let type: number = -1; // 0 = vert, 1 = frag, 2 = geo, 3 = attributes, 4 = uniforms -1 = not established yet
        let vertLines: string[] = [];
        let fragLines: string[] = [];
        let geoLines: string[] = [];
        let attributeLines: string[] = [];
        let uniformLines: string[] = [];

        let lines = data.split('\n');

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes("@vertex")) {
            type = 0;
            continue;
          } else if (lines[i].includes("@fragment")) {
            type = 1;
            continue;
          } else if (lines[i].includes("@geometry")) {
            type = 2;
            continue;
          } else if (lines[i].includes("@attributes")) {
            type = 3;
            continue;
          } else if (lines[i].includes("@uniforms")) {
            type = 4;
            continue;
          }

          switch (type) {
            case 0:
              vertLines.push(lines[i]);
              break;
            case 1:
              fragLines.push(lines[i]);
              break;
            case 2:
              vertLines.push(lines[i]);
              break;
            case 3:
              attributeLines.push(lines[i]);
              break;
            case 4:
              uniformLines.push(lines[i]);
              break;
            default:
              throw new Error("Malformed shader glsl file!");
          }
        }

        let shaderOuputs: ShaderFileOutput = {
          fragSource: fragLines.join('\n'),
          vertSource: vertLines.join('\n'),
          geoSource: geoLines.join('\n'),
          attributes: attributeLines,
          uniforms: uniformLines
        };

        resolve(shaderOuputs);
      })
      .catch((err: any) => {
        reject(err);
      })
  });
}

export {
  Custom,
  Shader,
  ShaderLocationType,
  Basic,
  BlinnPhong,
  loadFromFile
}