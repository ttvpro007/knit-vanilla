// =======================
// Imports
// =======================
import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui';
import VRControl from './examples/utils/VRControl.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Scene from './helpers/Scene.js';
import * as ModelFactory from './examples/utils/ModelFactory.js';
import * as UI from './helpers/UI.js';

// =======================
// Global Variables
// =======================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;

let selectState = false;
const objsToTest = [];

let camera, scene, video, renderer, vrControl;

// =======================
// Event Listeners
// =======================

// Pointer (desktop) event listeners
window.addEventListener('pointermove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('pointerdown', () => {
    selectState = true;
});

window.addEventListener('pointerup', () => {
    selectState = false;
});

// Touch (mobile) event listeners
window.addEventListener('touchstart', (event) => {
    selectState = true;
    mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('touchend', () => {
    selectState = false;
    mouse.x = null;
    mouse.y = null;
});

// Window load listener
window.addEventListener('load', init);
// Window resize listener
window.addEventListener('resize', onWindowResize);

// =======================
// Helper Functions
// =======================

/**
 * Toggle play/pause state of the video.
 */
function playPauseToggle() {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

/**
 * End the XR session.
 */
function exitSession() {
    setTimeout(() => {
        renderer?.xr?.getSession()?.end();
    }, 200);
}

/**
 * Update camera aspect and renderer size on window resize.
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Create and return the UI panel with buttons.
 */
function makePanel() {
    // Container block for the UI panel
    const container = UI.makeUIPanel(0, 0, -2);

    // Create buttons with their respective callback actions
    const buttonNext = UI.makeButton("Exit", exitSession);
    const buttonPrevious = UI.makeButton("Play/Pause", playPauseToggle);

    // Add buttons to the container
    container.add(buttonNext, buttonPrevious);

    // Add buttons to our list for raycasting tests
    objsToTest.push(buttonNext, buttonPrevious, container);

    return container;
}

/**
 * Raycast against UI objects.
 * @param {THREE.Raycaster} raycaster - The raycaster instance.
 * @returns {THREE.Intersection|null} - The closest intersection or null.
 */
function raycast(raycaster) {
    return objsToTest.reduce((closestIntersection, obj) => {
        const intersection = raycaster.intersectObject(obj, true);

        if (!intersection[0]) return closestIntersection;

        if (!closestIntersection || intersection[0].distance < closestIntersection.distance) {
            intersection[0].object = obj;
            return intersection[0];
        }

        return closestIntersection;
    }, null);
}

/**
 * Update UI buttons state based on pointer or controller interactions.
 */
function updateButtons() {
    let intersect;

    if (renderer.xr.isPresenting) {
        // Use VR controllers if in XR mode
        const controllers = vrControl.controllers;
        controllers.forEach((_, index) => {
            vrControl.setFromController(index, raycaster.ray);
            intersect = raycast(raycaster);

            // Position the pointer at the intersection point if any
            if (intersect) {
                vrControl.setPointerAt(index, intersect.point);
            }
        });
    } else if (mouse.x !== null && mouse.y !== null) {
        // Use mouse coordinates for desktop mode
        raycaster.setFromCamera(mouse, camera);
        intersect = raycast(raycaster);
    }

    // Update state of the intersected UI element
    if (intersect && intersect.object.isUI) {
        if (selectState) {
            intersect.object.setState('selected');
        } else {
            intersect.object.setState('hovered');
        }
    }

    // Reset state for non-targeted UI elements
    objsToTest.forEach((obj) => {
        if ((!intersect || obj !== intersect.object) && obj.isUI) {
            obj.setState('idle');
        }
    });
}

// =======================
// Main Loop & Initialization
// =======================

/**
 * Render loop
 */
function loop() {
    ThreeMeshUI.update();
    renderer.xr.updateCamera(camera);
    renderer.render(scene, camera);
    updateButtons();
}

/**
 * Initialization function.
 */
function init() {
    // Create container and append to document body
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Create the scene and video elements using helper module
    ({ scene, video } = Scene.createScene());

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );
    camera.layers.enable(1); // Render left view when no stereo available
    camera.position.set(0, 1.2, 0.3);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(loop);
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local');
    renderer.xr.cameraAutoUpdate = false;
    renderer.outputEncoding = THREE.sRGBEncoding;

    container.appendChild(renderer.domElement);

    // Set up XR session with hand-tracking support
    const sessionInit = { requiredFeatures: ['hand-tracking'] };
    document.body.appendChild(VRButton.createButton(renderer, sessionInit));

    // Set up VR controllers
    vrControl = VRControl(renderer, camera, scene);
    // Controller event listeners for select start/end
    vrControl.controllers.forEach((controller) => {
        controller.addEventListener('selectstart', () => {
            selectState = true;
        });
        controller.addEventListener('selectend', () => {
            selectState = false;
        });
    });
    scene.add(vrControl.controllerGrips[0], vrControl.controllers[0]);
    scene.add(vrControl.controllerGrips[1], vrControl.controllers[1]);

    // Create and add the UI panel to the scene
    const panel = makePanel();
    scene.add(panel);
}
