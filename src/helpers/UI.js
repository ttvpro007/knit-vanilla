import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui'

import { createText } from 'three/addons/webxr/Text2D.js';
import Object3D from '../components/Object3D.js';  
import { Button, makeButtonMesh, makeButtonMeshExt } from '../components/Button.js';
import Intersectable from '../tagcomponents/Intersectable.js';

export function createFloor(scene) {
    const floorGeometry = new THREE.PlaneGeometry(4, 4);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
}

export function createMenu(scene, positionX=0, positionY=0, positionZ=0) {
    const menuGeometry = new THREE.PlaneGeometry(1, 0.25);
    const menuMaterial = new THREE.MeshPhongMaterial({ opacity: 0, shininess: 0.5, transparent: true, opacity: 0.35});
    const menuMesh = new THREE.Mesh(menuGeometry, menuMaterial);
    menuMesh.position.set(positionX, positionY, positionZ);
    // menuMesh.rotation.y = -Math.PI / 12;
    scene.add(menuMesh);
    return menuMesh;
}

export function createButton(world, menu, label, color, positionX=0, positionY=0,positionZ=0, action) {
    const button = makeButtonMesh(0.35, 0.1, 0.01, color);
    button.position.set(positionX, positionY, positionZ);
    menu.add(button);

    if (label) {
        const buttonText = createText(label, 0.06);
        button.add(buttonText);
        buttonText.position.set(0, 0, 0.01);
    }

    const entity = world.createEntity();
    entity.addComponent(Intersectable);
    entity.addComponent(Object3D, { object: button });
    entity.addComponent(Button, { action });

    return entity;
}

// Options for component.setupState().
// It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

const hoveredStateAttributes = {
    state: 'hovered',
    attributes: {
        offset: 0.035,
        backgroundColor: new THREE.Color( 0x999999 ),
        backgroundOpacity: 1,
        fontColor: new THREE.Color( 0xffffff )
    },
};

const idleStateAttributes = {
    state: 'idle',
    attributes: {
        offset: 0.035,
        backgroundColor: new THREE.Color( 0x666666 ),
        backgroundOpacity: 0.3,
        fontColor: new THREE.Color( 0xffffff )
    },
};

const selectedAttributes = {
    offset: 0.02,
    backgroundColor: new THREE.Color( 0x777777 ),
    fontColor: new THREE.Color( 0x222222 )
};

export function createButtonExt(world, menu, label, positionX=0, positionY=0,positionZ=0, action) {
    const button = makeButtonMeshExt();

    button.position.set(positionX, positionY, positionZ);

    menu.add(button);

    if (label) {
        button.add(
            new ThreeMeshUI.Text( { content: label } )
        );
    }

    // const entity = world.createEntity();
    // entity.addComponent(Intersectable);
    // entity.addComponent(Object3D, { object: button });
    // entity.addComponent(Button, { action });

	button.setupState( {
		state: 'selected',
		attributes: selectedAttributes,
		onSet: action
	} );
	button.setupState( hoveredStateAttributes );
	button.setupState( idleStateAttributes );

    const entity = world.createEntity();
    entity.addComponent(Intersectable);
    entity.addComponent(Object3D, { object: button });
    // entity.addComponent(Button, { action });

    return entity;
}

export function createInstructionText(world, scene, text, position, visible = true) {
    const instructionText = createText(text, 0.04);
    instructionText.position.set(...position);
    instructionText.visible = visible;
    scene.add(instructionText);

    const entity = world.createEntity();
    entity.addComponent(Object3D, { object: instructionText });

    return instructionText;
}
