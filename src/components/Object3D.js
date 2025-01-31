import { Component, Types } from 'three/addons/libs/ecsy.module.js';

export default class Object3D extends Component {
    static schema = {
        object: { type: Types.Ref }
    };
}