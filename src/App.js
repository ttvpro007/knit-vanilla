import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

import Object3D from './components/Object3D.js';  
import Intersectable from './tagcomponents/Intersectable.js';
import Rotating from './tagcomponents/Rotating.js';
import OffsetFromCamera from './components/OffsetFromCamera.js';
import NeedCalibration from './tagcomponents/NeedCalibration.js';
import * as Controllers from './helpers/Controllers.js';
import * as UI from './helpers/UI.js';
import * as Scene from './helpers/Scene.js';
import { setupWorld } from './helpers/World.js';

const clock = new THREE.Clock();
let world, camera, scene, renderer;

// Setup torus knot
function createTorusKnot(world, scene, color=0xffffff, shininess=0.8) {
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

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    const delta = clock.getDelta();
    const elapsedTime = clock.elapsedTime;
    renderer.xr.updateCamera( camera );
    world.execute( delta, elapsedTime );
    renderer.render( scene, camera );

}

init();

function init() {

    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    // Scene setup
    scene = Scene.createScene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10);
    camera.position.set(0, 1.2, 0.3);

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animate );
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    renderer.xr.cameraAutoUpdate = false;

    container.appendChild( renderer.domElement );

    const sessionInit = {
        requiredFeatures: [ 'hand-tracking' ]
    };

    document.body.appendChild( VRButton.createButton( renderer, sessionInit ) );

    // Setup left-hand (index 0)
    const controller1 = Controllers.setupController(renderer, scene, 0);
    const controllerGrip1 = Controllers.setupControllerGrip(renderer, scene, 0);
    const hand1 = Controllers.setupHand(renderer, scene, 0);
    const handPointer1 = Controllers.setupHandPointer(hand1, controller1);

    // Setup right-hand (index 1)
    const controller2 = Controllers.setupController(renderer, scene, 1);
    const controllerGrip2 = Controllers.setupControllerGrip(renderer, scene, 1);
    const hand2 = Controllers.setupHand(renderer, scene, 1);
    const handPointer2 = Controllers.setupHandPointer(hand2, controller2);

    world = setupWorld(
        renderer,
        camera,
        [controllerGrip1, controllerGrip2],
        [handPointer1, handPointer2]
    );

    // Scene Setup
    UI.createFloor(scene);
    const menuMesh = UI.createMenu(scene);
    const torusKnot = Scene.createTorusKnot(world, scene);
    const exitText = UI.createInstructionText(world, scene, 'Exiting session...', [0, 1.5, -0.6], false);

    // Create menu buttons
    UI.createButton(world, menuMesh, null, 0xffd3b5, 0.18, () => torusKnot.material.color.setHex(0xffd3b5)); // Orange
    UI.createButton(world, menuMesh, null, 0xe84a5f, 0.06, () => torusKnot.material.color.setHex(0xe84a5f)); // Pink
    UI.createButton(world, menuMesh, 'reset', 0x355c7d, -0.06, () => torusKnot.material.color.setHex(0xffffff)); // Reset
    UI.createButton(world, menuMesh, 'exit', 0xff0000, -0.18, function () {
        exitText.visible = true;
        setTimeout(() => {
            exitText.visible = false;
            renderer.xr.getSession().end();
        }, 2000);
    });

    // Menu entity
    const menuEntity = world.createEntity();
    menuEntity.addComponent(Intersectable);
    menuEntity.addComponent(OffsetFromCamera, { x: 0.4, y: 0, z: -1 });
    menuEntity.addComponent(NeedCalibration);
    menuEntity.addComponent(Object3D, { object: menuMesh });

    // Instruction text entity
    UI.createInstructionText(world, scene, 'This is a WebXR Hands demo, please explore with hands.', [0, 1.6, -0.6]);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}
