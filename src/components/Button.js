import * as THREE from 'three';
import { Component, Types } from 'three/addons/libs/ecsy.module.js';

export class Button extends Component {
    static schema = {
        currState: { type: Types.String, default: 'none' },
        prevState: { type: Types.String, default: 'none' },
        action: { type: Types.Ref, default: () => {} }
    };
}

export function makeButtonMesh(x, y, z, color) {
    const geometry = new THREE.BoxGeometry(x, y, z);
    const material = new THREE.MeshPhongMaterial({ color: color });
    const buttonMesh = new THREE.Mesh(geometry, material);
    buttonMesh.castShadow = true;
    buttonMesh.receiveShadow = true;
    return buttonMesh;
}

// export function makeButtonMesh(width, height, depth, color) {
//     const geometry = new THREE.BoxGeometry(width, height, depth);
//     const material = new THREE.MeshPhongMaterial({ color });
//     return new THREE.Mesh(geometry, material);
// }
