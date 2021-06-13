import { loadFromFile, ShaderFileOutput } from ".";
import { Shader, ShaderAttributes } from "./Shader";


export class Custom extends Shader {
  file: string;

  constructor(file: string) {

    const props: ShaderAttributes = {
      vertSource:
        `
      `,
      fragSource:
        `
      `
    }

    super(props);
    this.file = file;
  }

  async initShaderProgram() {
    let output: ShaderFileOutput = await loadFromFile(this.file) as ShaderFileOutput;
    this.props.fragSource = output.fragSource;
    this.props.vertSource = output.vertSource;
    this.props.geoSource = output.geoSource;
    super.initShaderProgram();
    this.addUniforms(output.uniforms);
    this.addAttributes(output.attributes);
  }
}