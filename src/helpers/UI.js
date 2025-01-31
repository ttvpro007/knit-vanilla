import * as THREE from 'three';
import { createText } from 'three/addons/webxr/Text2D.js';
import Object3D from '../components/Object3D.js';  
import { Button, makeButtonMesh } from '../components/Button.js';
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

export function createInstructionText(world, scene, text, position, visible = true) {
    const instructionText = createText(text, 0.04);
    instructionText.position.set(...position);
    instructionText.visible = visible;
    scene.add(instructionText);

    const entity = world.createEntity();
    entity.addComponent(Object3D, { object: instructionText });

    return instructionText;
}
