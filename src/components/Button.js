import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui'

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

// We start by creating objects containing options that we will use with the two buttons,
// in order to write less code.
const defaultButtonOptions = {
    width: 0.4,
    height: 0.15,
    justifyContent: 'center',
    offset: 0.05,
    margin: 0.02,
    borderRadius: 0.075
};

export function makeButtonMeshExt(buttonOptions=null)
{
    if (!buttonOptions)
    {
        buttonOptions = defaultButtonOptions;
    }

    return new ThreeMeshUI.Block( buttonOptions );
}

// export function makeButtonMesh(width, height, depth, color) {
//     const geometry = new THREE.BoxGeometry(width, height, depth);
//     const material = new THREE.MeshPhongMaterial({ color });
//     return new THREE.Mesh(geometry, material);
// }
