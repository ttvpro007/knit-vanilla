import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import ThreeMeshUI from 'three-mesh-ui';
import VRControl from './utils/VRControl.js';

import * as ModelFactory from './utils/ModelFactory.js';

let scene, camera, renderer, controls, vrControl, video;
let meshContainer, meshes, currentMesh;
const objsToTest = [];

window.addEventListener( 'load', init );
window.addEventListener( 'resize', onWindowResize );

// compute mouse position in normalized device coordinates
// (-1 to +1) for both directions.
// Used to raycasting against the interactive elements

const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;

let selectState = false;

window.addEventListener( 'pointermove', ( event ) => {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
} );

window.addEventListener( 'pointerdown', () => {
	selectState = true;
} );

window.addEventListener( 'pointerup', () => {
	selectState = false;
} );

window.addEventListener( 'touchstart', ( event ) => {
	selectState = true;
	mouse.x = ( event.touches[ 0 ].clientX / window.innerWidth ) * 2 - 1;
	mouse.y = -( event.touches[ 0 ].clientY / window.innerHeight ) * 2 + 1;
} );

window.addEventListener( 'touchend', () => {
	selectState = false;
	mouse.x = null;
	mouse.y = null;
} );
  
function playPauseToggle() {
    if (video.paused) {
        video.play();
		console.log("Play");
    } else {
		video.pause();
		console.log("Pause");
    }
}

function exitSession() {
    setTimeout(() => {
		var session = renderer.xr.getSession();
		if (session) {
			renderer.xr.getSession().end();
			console.log("Exit");
		}
    }, 200);
}

//

function init() {

	const divContainer = document.createElement( 'div' );
	document.body.appendChild( divContainer );

	////////////////////////
	//  Basic Three Setup
	////////////////////////

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x505050 );

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 2000 );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( loop );
    renderer.shadowMap.enabled = true;
	renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType( 'local' );
    renderer.xr.cameraAutoUpdate = false;
	renderer.outputEncoding = THREE.sRGBEncoding;
	divContainer.appendChild( VRButton.createButton( renderer ) );
	divContainer.appendChild( renderer.domElement );

	// Orbit controls for no-vr

	controls = new OrbitControls( camera, renderer.domElement );
	camera.position.set( 0, 1.6, 0.3 );
	controls.target = new THREE.Vector3( 0, 1, -1.8 );

	/////////
	// Room
	/////////

	// var room = ModelFactory.room;
	// var roomMesh = ModelFactory.roomMesh;

	//////////
	// Light
	//////////

	var light = ModelFactory.light;
	var hemLight = ModelFactory.hemLight;

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

	////////////////////
	// Primitive Meshes
	////////////////////

	meshContainer = new THREE.Group();
	meshContainer.position.set( 0, 1, -1.9 );
	var sphere = ModelFactory.makeSphere( meshContainer );
	var box = ModelFactory.makeBox( meshContainer );
	var cone = ModelFactory.makeCone( meshContainer );
	sphere.visible = box.visible = cone.visible = false;
	meshes = [ sphere, box, cone ];
	currentMesh = 0;

	showMesh( currentMesh );

	//////////
	// Panel
	//////////

	var container = makePanel();

	//////////////
	// 360 Video
	//////////////

	video = ModelFactory.make360Video( scene );

	// scene.add( room );
	scene.add( light, hemLight );
	scene.add( vrControl.controllerGrips[ 0 ], vrControl.controllers[ 0 ] );
	scene.add( meshContainer );
	scene.add( container );

	// objsToTest.push( roomMesh );

}

// Shows the primitive mesh with the passed ID and hide the others

function showMesh( id ) {
	meshes.forEach( ( mesh, i ) => {
		mesh.visible = i === id;
	} );
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
			currentMesh = ( currentMesh + 1 ) % 3;
			showMesh( currentMesh );
			exitSession();
		}
	);
	var buttonPrevious = ModelFactory.makeButton(
		"P",
		() => {
			currentMesh -= 1;
			if ( currentMesh < 0 ) currentMesh = 2;
			showMesh( currentMesh );
			playPauseToggle();
		}
	);

	container.add( buttonNext, buttonPrevious );
	objsToTest.push( buttonNext, buttonPrevious );

	return container;
}

// Handle resizing the viewport

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function loop() {

	// Don't forget, ThreeMeshUI must be updated manually.
	// This has been introduced in version 3.0.0 in order
	// to improve performance
	ThreeMeshUI.update();

	controls.update();

	meshContainer.rotation.z += 0.01;
	meshContainer.rotation.y += 0.01;

	renderer.render( scene, camera );

	updateButtons();

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

	} else if ( mouse.x !== null && mouse.y !== null ) {

		raycaster.setFromCamera( mouse, camera );

		intersect = raycast();

	}

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

//

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