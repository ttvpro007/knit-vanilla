import * as THREE from 'three';
import Object3D from '../components/Object3D.js';  
import Rotating from '../tagcomponents/Rotating.js';

export function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x101010 );

    // Lighting
    scene.add(new THREE.HemisphereLight(0xcccccc, 0x999999, 3));

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0, 6, 0);
    light.castShadow = true;
    light.shadow.camera.top = 2;
    light.shadow.camera.bottom = -2;
    light.shadow.camera.right = 2;
    light.shadow.camera.left = -2;
    light.shadow.mapSize.set(4096, 4096);
    scene.add(light);

    return scene;
}

export function createTorusKnot(world, scene, color = 0xffffff, shininess = 0.8) {
    const tkGeometry = new THREE.TorusKnotGeometry(0.5, 0.2, 200, 32);
    const tkMaterial = new THREE.MeshPhongMaterial({ color: color, shininess: shininess });
    const torusKnot = new THREE.Mesh(tkGeometry, tkMaterial);
    torusKnot.position.set(0, 1, -5);
    scene.add(torusKnot);

    const entity = world.createEntity();
    entity.addComponent(Rotating);
    entity.addComponent(Object3D, { object: torusKnot });

    return torusKnot;
}
