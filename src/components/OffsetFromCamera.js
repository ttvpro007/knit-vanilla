import { Component, Types } from 'three/addons/libs/ecsy.module.js';

export default class OffsetFromCamera extends Component {
    static schema = {
        x: { type: Types.Number, default: 0 },
        y: { type: Types.Number, default: 0 },
        z: { type: Types.Number, default: 0 }
    };
}
