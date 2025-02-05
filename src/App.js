import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui';
import VRControl from './examples/utils/VRControl.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Scene from './helpers/Scene.js';
import * as ModelFactory from './examples/utils/ModelFactory.js';

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
        renderer?.xr?.getSession()?.end();
    }, 200);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function loop() {
    ThreeMeshUI.update();
    renderer.xr.updateCamera( camera );
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
    vrControl.controllers[ 1 ].addEventListener( 'selectstart', () => {
        selectState = true;
    } );
    vrControl.controllers[ 1 ].addEventListener( 'selectend', () => {
        selectState = false;
    } );	
    scene.add( vrControl.controllerGrips[ 0 ], vrControl.controllers[ 0 ] );
    scene.add( vrControl.controllerGrips[ 1 ], vrControl.controllers[ 1 ] );


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
        "Exit",
        () => {
            exitSession();
        }
    );
    var buttonPrevious = ModelFactory.makeButton(
        "Play/Pause",
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

        const controllers = vrControl.controllers;

        controllers.forEach((_, index) => {

		    vrControl.setFromController( index, raycaster.ray );
		    intersect = raycast( index, raycaster );
                
            // Position the little white dot at the end of the controller pointing ray
            if ( closestIntersection ) vrControl.setPointerAt( index, closestIntersection.point );


        });

		// vrControl.setFromController( 0, raycaster.ray );
		// intersect = raycast( raycaster );

		// Position the little white dot at the end of the controller pointing ray
		// if ( intersect ) vrControl.setPointerAt( 0, intersect.point );
	} else if ( mouse.x !== null && mouse.y !== null ) {

		raycaster.setFromCamera( mouse, camera );

		intersect = raycast( 0, raycaster );

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

// function raycast(raycaster) {

// 	return objsToTest.reduce( ( closestIntersection, obj ) => {

// 		const intersection = raycaster.intersectObject( obj, true );

// 		if ( !intersection[ 0 ] ) return closestIntersection;

// 		if ( !closestIntersection || intersection[ 0 ].distance < closestIntersection.distance ) {

// 			intersection[ 0 ].object = obj;

// 			return intersection[ 0 ];

// 		}

// 		return closestIntersection;

// 	}, null );

// }

function raycast(index, raycaster) {

    return objsToTest.reduce( ( closestIntersection, obj ) => {

        const intersection = raycaster.intersectObject( obj, true );

        if ( !intersection[ index ] ) return closestIntersection;

        if ( !closestIntersection || intersection[ index ].distance < closestIntersection.distance ) {

            intersection[ index ].object = obj;

            return intersection[ index ];

        }

        return closestIntersection;

    }, null );
}