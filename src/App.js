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
import Draggable from './components/Draggable.js';

const clock = new THREE.Clock();
let world, camera, scene, video, renderer;
  
function playPauseToggle() {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

function exitSession()
{
    setTimeout(() => {
        renderer.xr.getSession().end();
    }, 200);
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
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.layers.enable( 1 ); // render left view when no stereo available
    camera.position.set(0, 1.2, 0.3);

    //

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animate );
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType( 'local' );
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
    const menuMesh = UI.createMenu(scene, 0, 0, -2);

    const testButton = document.getElementById( 'testButton' );
    testButton.addEventListener('click', playPauseToggle);

    // Create menu buttons
    UI.createButton(world, menuMesh, 'play/pause', 0xffd3b5, -0.2, 0, 0.01, playPauseToggle);
    UI.createButton(world, menuMesh, 'exit', 0xffd3b5, 0.2, 0, 0.01, exitSession);

    // Menu entity
    const menuEntity = world.createEntity();
    menuEntity.addComponent(Intersectable);
    menuEntity.addComponent(OffsetFromCamera, { x: 0.4, y: 0, z: -1 });
    menuEntity.addComponent(NeedCalibration);
    menuEntity.addComponent(Draggable);
    menuEntity.addComponent(Object3D, { object: menuMesh });

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}
