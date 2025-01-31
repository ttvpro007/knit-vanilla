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

export function createMenu(scene) {
    const menuGeometry = new THREE.PlaneGeometry(0.24, 0.5);
    const menuMaterial = new THREE.MeshPhongMaterial({ opacity: 0, transparent: true });
    const menuMesh = new THREE.Mesh(menuGeometry, menuMaterial);
    menuMesh.position.set(0.4, 1, -1);
    menuMesh.rotation.y = -Math.PI / 12;
    scene.add(menuMesh);
    return menuMesh;
}

export function createButton(world, menu, label, color, position, action) {
    const button = makeButtonMesh(0.2, 0.1, 0.01, color);
    button.position.set(0, position, 0);
    menu.add(button);

    if (label) {
        const buttonText = createText(label, 0.06);
        button.add(buttonText);
        buttonText.position.set(0, 0, 0.0051);
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
