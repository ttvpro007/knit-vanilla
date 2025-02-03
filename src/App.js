import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui';
import VRControl from './examples/utils/VRControl.js';

import { VRButton } from 'three/addons/webxr/VRButton.js';

import Object3D from './components/Object3D.js';
import Intersectable from './tagcomponents/Intersectable.js';
import OffsetFromCamera from './components/OffsetFromCamera.js';
import NeedCalibration from './tagcomponents/NeedCalibration.js';
import Draggable from './components/Draggable.js';
import * as Controllers from './helpers/Controllers.js';
import * as UI from './helpers/UI.js';
import * as Scene from './helpers/Scene.js';
import { setupWorld } from './helpers/World.js';
// import VideoController from './components/VideoController.js';

import * as ModelFactory from './examples/utils/ModelFactory.js';

const raycaster = new THREE.Raycaster();
const clock = new THREE.Clock();
const objsToTest = [];
let world, camera, scene, video, renderer, vrControl;
  
function playPauseToggle() {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

function exitSession() {
    setTimeout(() => {
        renderer.xr.getSession().end();
    }, 200);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function loop() {
    ThreeMeshUI.update();
	// controls.update();

    const delta = clock.getDelta();
    const elapsedTime = clock.elapsedTime;
    renderer.xr.updateCamera( camera );
    world.execute( delta, elapsedTime );
    renderer.render( scene, camera );

	updateButtons();
}

init();

function init() {
    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    // Scene setup
    ( { scene, video } = Scene.createScene() );

    // Camera setup
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.layers.enable( 1 ); // render left view when no stereo available
    camera.position.set(0, 1.2, 0.3);

    //

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( loop );
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType( 'local' );
    renderer.xr.cameraAutoUpdate = false;
	renderer.outputEncoding = THREE.sRGBEncoding;

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
    UI.createButton(world, menuMesh, 'exit', 0xffd3b5, 0.2, 0, 0.01, playPauseToggle);
    // UI.createButtonExt(world, menuMesh, 'play/pause', -0.2, 0, 0.01, playPauseToggle);
    // UI.createButtonExt(world, menuMesh, 'exit', 0.2, 0, 0.01, exitSession);

    // Menu entity
    const menuEntity = world.createEntity();
    menuEntity.addComponent(Intersectable);
    menuEntity.addComponent(OffsetFromCamera, { x: 0.4, y: 0, z: -1 });
    menuEntity.addComponent(NeedCalibration);
    menuEntity.addComponent(Object3D, { object: menuMesh });
    menuEntity.addComponent(Draggable);
    
    ////////////////
    // Controllers
    ////////////////

    vrControl = VRControl( renderer, camera, scene );
    vrControl.controllers[ 0 ].addEventListener( 'selectstart', () => {
        selectState = true;
    } );
    vrControl.controllers[ 0 ].addEventListener( 'selectend', () => {
        selectState = false;
    } );	
    scene.add( vrControl.controllerGrips[ 0 ], vrControl.controllers[ 0 ] );


	//////////
	// Panel
	//////////

	var panel = makePanel();
    scene.add( panel );

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

///////////////////
// UI contruction
///////////////////

function makePanel() {

    // Container block, in which we put the two buttons.
    var container = ModelFactory.makeUIPanel();
    var buttonNext = ModelFactory.makeButton(
        "N",
        () => {
            exitSession();
        }
    );
    var buttonPrevious = ModelFactory.makeButton(
        "P",
        () => {
            playPauseToggle();
        }
    );

    container.add( buttonNext, buttonPrevious );
    objsToTest.push( buttonNext, buttonPrevious );

    return container;
}

// Called in the loop, get intersection with either the mouse or the VR controllers,
// then update the buttons states according to result

function updateButtons() {

	// Find closest intersecting object

	let intersect;

	if ( renderer.xr.isPresenting ) {

		vrControl.setFromController( 0, raycaster.ray );

		intersect = raycast();

		// Position the little white dot at the end of the controller pointing ray
		if ( intersect ) vrControl.setPointerAt( 0, intersect.point );
    }
	// } else if ( mouse.x !== null && mouse.y !== null ) {

	// 	raycaster.setFromCamera( mouse, camera );

	// 	intersect = raycast();

	// }

	// Update targeted button state (if any)

	if ( intersect && intersect.object.isUI ) {

		if ( selectState ) {

			// Component.setState internally call component.set with the options you defined in component.setupState
			intersect.object.setState( 'selected' );

		} else {

			// Component.setState internally call component.set with the options you defined in component.setupState
			intersect.object.setState( 'hovered' );

		}

	}

	// Update non-targeted buttons state

	objsToTest.forEach( ( obj ) => {

		if ( ( !intersect || obj !== intersect.object ) && obj.isUI ) {

			// Component.setState internally call component.set with the options you defined in component.setupState
			obj.setState( 'idle' );

		}

	} );

}

function raycast() {

	return objsToTest.reduce( ( closestIntersection, obj ) => {

		const intersection = raycaster.intersectObject( obj, true );

		if ( !intersection[ 0 ] ) return closestIntersection;

		if ( !closestIntersection || intersection[ 0 ].distance < closestIntersection.distance ) {

			intersection[ 0 ].object = obj;

			return intersection[ 0 ];

		}

		return closestIntersection;

	}, null );

}