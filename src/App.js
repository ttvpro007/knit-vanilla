import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

import Object3D from './components/Object3D.js';
import Intersectable from './tagcomponents/Intersectable.js';
import OffsetFromCamera from './components/OffsetFromCamera.js';
import NeedCalibration from './tagcomponents/NeedCalibration.js';
import * as Controllers from './helpers/Controllers.js';
import * as UI from './helpers/UI.js';
import * as Scene from './helpers/Scene.js';
import { setupWorld } from './helpers/World.js';

const clock = new THREE.Clock();
let world, camera, scene, video, renderer;

// button.addEventListener('click', onButtonClick);

function onButtonClick() {
    // This will allow us to play video later...
    video.load();
    fetchVideoAndPlay();
}

function fetchVideoAndPlay() {
    fetch('https://example.com/file.mp4')
    .then(response => response.blob())
    .then(blob => {
        video.srcObject = blob;
        return video.play();
    })
    .then(_ => {
        // Video playback started ;)
    })
    .catch(e => {
        // Video playback failed ;(
    })
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
    ({scene, video} = Scene.createScene());

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

    const sessionInit = { requiredFeatures: [ 'hand-tracking' ] };

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

    world = setupWorld(renderer, camera, [controllerGrip1, controllerGrip2], [handPointer1, handPointer2]);

    // Scene Setup
    UI.createFloor(scene);
    const menuMesh = UI.createMenu(scene);
    const torusKnot = Scene.createTorusKnot(world, scene);
    const exitText = UI.createInstructionText(world, scene, 'Exiting session...', [0, 1.5, -0.6], false);

    // Create menu buttons
    UI.createButton(world, menuMesh, 'play', 0xffd3b5, 0.3, () => onButtonClick); // Orange
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

// import * as THREE from 'three';
// import { VRButton } from 'three/addons/webxr/VRButton.js';
// import { createScene, createTorusKnot, createVideoScene } from './helpers/Scene.js';
// import * as Controllers from './helpers/Controllers.js';
// import * as UI from './helpers/UI.js';
// import { setupWorld } from './helpers/World.js';
// import Intersectable from './tagcomponents/Intersectable.js';
// import OffsetFromCamera from './components/OffsetFromCamera.js';
// import NeedCalibration from './tagcomponents/NeedCalibration.js';
// import Object3D from './components/Object3D.js';

// let world, camera, renderer;
// let mainScene, videoScene, activeScene;
// const clock = new THREE.Clock();
// const container = document.getElementById('container');

// function onWindowResize() {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// }

// function animate() {
//     const delta = clock.getDelta();
//     const elapsedTime = clock.elapsedTime;
//     renderer.xr.updateCamera(camera);
//     world.execute(delta, elapsedTime);
//     renderer.render(activeScene, camera);
// }

// function init() {
//     const container = document.createElement( 'div' );
//     document.body.appendChild( container );

//     // Setup Renderer
//     renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setPixelRatio(window.devicePixelRatio);
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setAnimationLoop(animate);
//     renderer.shadowMap.enabled = true;
//     renderer.xr.enabled = true;
//     renderer.xr.cameraAutoUpdate = false;
//     container.appendChild(renderer.domElement);

//     // Create VR Button
//     document.body.appendChild(VRButton.createButton(renderer));

//     // Setup Camera
//     camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 2000);
//     camera.position.set(0, 1.2, 0.3);
//     camera.layers.enable(1); // Render left view when no stereo available

//     // Load Scenes
//     mainScene = createScene();

//     const videoSceneData = createVideoScene();
//     videoScene = videoSceneData.scene;

//     // Set Initial Scene
//     activeScene = mainScene;

//     // Setup Controllers
//     const controller1 = Controllers.setupController(renderer, mainScene, 0);
//     const controllerGrip1 = Controllers.setupControllerGrip(renderer, mainScene, 0);
//     const hand1 = Controllers.setupHand(renderer, mainScene, 0);
//     const handPointer1 = Controllers.setupHandPointer(hand1, controller1);

//     const controller2 = Controllers.setupController(renderer, mainScene, 1);
//     const controllerGrip2 = Controllers.setupControllerGrip(renderer, mainScene, 1);
//     const hand2 = Controllers.setupHand(renderer, mainScene, 1);
//     const handPointer2 = Controllers.setupHandPointer(hand2, controller2);

//     // Setup World
//     world = setupWorld(renderer, camera, [controllerGrip1, controllerGrip2], [handPointer1, handPointer2]);

//     const torusKnot = createTorusKnot(world, mainScene);

//     // UI Setup
//     UI.createFloor(mainScene);
//     const menuMesh = UI.createMenu(mainScene);
//     const exitText = UI.createInstructionText(world, mainScene, 'Exiting session...', [0, 1.5, -0.6], false);

//     // Create Menu Buttons
//     UI.createButton(world, menuMesh, 'switch-video', 0x00ff00, 0.3, switchToVideoScene); // Green = Switch to Video
//     UI.createButton(world, menuMesh, 'switch-main', 0xffa500, 0.1, switchToMainScene); // Orange = Switch back
//     UI.createButton(world, menuMesh, 'reset', 0x355c7d, -0.1, () => torusKnot.material.color.setHex(0xffffff));
//     UI.createButton(world, menuMesh, 'exit', 0xff0000, -0.3, function () {
//         exitText.visible = true;
//         setTimeout(() => {
//             exitText.visible = false;
//             renderer.xr.getSession().end();
//         }, 2000);
//     });

//     // Menu Entity
//     const menuEntity = world.createEntity();
//     menuEntity.addComponent(Intersectable);
//     menuEntity.addComponent(OffsetFromCamera, { x: 0.4, y: 0, z: -1 });
//     menuEntity.addComponent(NeedCalibration);
//     menuEntity.addComponent(Object3D, { object: menuMesh });

//     // Instruction Text
//     UI.createInstructionText(world, mainScene, 'This is a WebXR Hands demo, please explore with hands.', [0, 1.6, -0.6]);

//     // Event Listeners
//     window.addEventListener('resize', onWindowResize);
// }

// // Switch to 360 Video Scene
// function switchToVideoScene() {
//     activeScene = videoScene;
// }

// // Switch back to Main Scene
// function switchToMainScene() {
//     activeScene = mainScene;
// }

// // Initialize App
// init();
