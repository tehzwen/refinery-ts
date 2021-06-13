import { Light, LightAttributes, LightType } from "./Light";


export class PointLight extends Light {
    public constant: number;
    public linear: number;
    public quadratic: number;

    constructor(props: LightAttributes) {
      super(props);
      this.constant = props.constant || 0.2;
      this.linear = props.linear || 0.2;
      this.quadratic = props.quadratic || 0.8;
      this.type = LightType.POINT;
    }
}