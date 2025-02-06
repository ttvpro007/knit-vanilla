import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui'

import { createText } from 'three/addons/webxr/Text2D.js';
import Object3D from '../components/Object3D.js';  
import { Button, makeButtonMesh, makeButtonMeshExt } from '../components/Button.js';
import Intersectable from '../tagcomponents/Intersectable.js';

import FontJSON from '../examples/assets/Roboto-msdf.json';
import FontImage from '../examples/assets/Roboto-msdf.png';

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

// Options for component.setupState().
// It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

const hoveredStateAttributes = {
    state: 'hovered',
    attributes: {
        offset: 0.035,
        backgroundColor: new THREE.Color( 0x999999 ),
        backgroundOpacity: 1,
        fontColor: new THREE.Color( 0xffffff )
    },
};

const idleStateAttributes = {
    state: 'idle',
    attributes: {
        offset: 0.035,
        backgroundColor: new THREE.Color( 0x666666 ),
        backgroundOpacity: 0.3,
        fontColor: new THREE.Color( 0xffffff )
    },
};

const selectedAttributes = {
    offset: 0.02,
    backgroundColor: new THREE.Color( 0x777777 ),
    fontColor: new THREE.Color( 0x222222 )
};

export function createButtonExt(world, menu, label, positionX=0, positionY=0,positionZ=0, action) {
    const button = makeButtonMeshExt();

    button.position.set(positionX, positionY, positionZ);

    menu.add(button);

    if (label) {
        button.add(
            new ThreeMeshUI.Text( { content: label } )
        );
    }

    // const entity = world.createEntity();
    // entity.addComponent(Intersectable);
    // entity.addComponent(Object3D, { object: button });
    // entity.addComponent(Button, { action });

	button.setupState( {
		state: 'selected',
		attributes: selectedAttributes,
		onSet: action
	} );
	button.setupState( hoveredStateAttributes );
	button.setupState( idleStateAttributes );

    const entity = world.createEntity();
    entity.addComponent(Intersectable);
    entity.addComponent(Object3D, { object: button });
    // entity.addComponent(Button, { action });

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

// ========================================================
// UI Panel and Button Factory Functions for ThreeMeshUI
// ========================================================

// import * as THREE from 'three';
// import ThreeMeshUI from 'three-mesh-ui';
// Make sure to import or define FontJSON and FontImage

// -------------------------
// Shared Configurations
// -------------------------

// Panel Configuration
const PANEL_CONFIG = {
    fontFamily: FontJSON,        // Font JSON definition (should be imported or defined)
    fontTexture: FontImage,      // Font texture image (should be imported or defined)
    fontSize: 0.07,
    padding: 0.05,
    borderRadius: 0.11,
    justifyContent: 'center',
    contentDirection: 'row-reverse',
    rotationX: -0.55
};

// Button Base Options
const BUTTON_OPTIONS = {
    width: 0.4,
    height: 0.15,
    justifyContent: 'center',
    offset: 0.05,
    margin: 0.02,
    borderRadius: 0.075
};

// Button State Configurations
const BUTTON_STATES = {
    hovered: {
        attributes: {
            offset: 0.035,
            backgroundColor: new THREE.Color(0xffffff),
            backgroundOpacity: 1,
            fontColor: new THREE.Color(0x222222)
        }
    },
    idle: {
        attributes: {
            offset: 0.035,
            backgroundColor: new THREE.Color(0xdddddd),
            backgroundOpacity: 0.3,
            fontColor: new THREE.Color(0xffffff)
        }
    },
    selected: {
        attributes: {
            offset: 0.02,
            backgroundColor: new THREE.Color(0x777777),
            fontColor: new THREE.Color(0x222222)
        }
    }
};

// Panel state configurations for different interactions
const PANEL_STATES = {
    // The "selected" state is activated when the panel is pressed down, triggering the holdAction.
    selected: {
        attributes: {
            // Visual feedback for when the panel is being dragged.
            // You might choose to change color, opacity, or add a slight scale effect.
            backgroundColor: new THREE.Color(0xcccccc),
            backgroundOpacity: 0.8
            // Add any additional visual feedback (e.g. scaling) if needed.
        }
    },
    // The "hovered" state gives the user a visual cue when the pointer is over the panel.
    hovered: {
        attributes: {
            backgroundColor: new THREE.Color(0xdddddd),
            backgroundOpacity: 0.9
        }
    },
    // The "idle" state represents the default appearance of the panel.
    idle: {
        attributes: {
            backgroundColor: new THREE.Color(0x999999),
            backgroundOpacity: 1.0
        }
    }
};

// -------------------------
// Factory Function for UI Panel with Drag Actions
// -------------------------

/**
 * Creates a UI panel (container) for UI elements.
 *
 * The panel is set up with interactive states: "selected" for when the panel is dragged,
 * "hovered" for mouse-over feedback, and "idle" for the default appearance.
 *
 * @param {number} x - The x-coordinate for the panel's position.
 * @param {number} y - The y-coordinate for the panel's position.
 * @param {number} z - The z-coordinate for the panel's position.
 * @param {Function} holdAction - The callback to trigger when the panel is held (e.g. start dragging).
 * @param {Function} releasedAction - The callback to trigger when the panel is released (e.g. end dragging).
 * @returns {ThreeMeshUI.Block} The configured panel.
 */
export function makeUIPanel(x, y, z, holdAction, releasedAction) {
    // Create the container block with auto-fit dimensions using PANEL_CONFIG settings
    const container = new ThreeMeshUI.Block({
        justifyContent: PANEL_CONFIG.justifyContent,
        contentDirection: PANEL_CONFIG.contentDirection,
        fontFamily: PANEL_CONFIG.fontFamily,
        fontTexture: PANEL_CONFIG.fontTexture,
        fontSize: PANEL_CONFIG.fontSize,
        padding: PANEL_CONFIG.padding,
        borderRadius: PANEL_CONFIG.borderRadius
    });

    // Setup the interactive states:

    // "selected" state: when the panel is pressed or dragged.
    container.setupState({
        state: 'selected',
        attributes: PANEL_STATES.selected.attributes,
        onSet: holdAction.bind(container)  // Triggered when the panel enters the "selected" state.
    });

    // "hovered" state: when the pointer is over the panel.
    container.setupState({
        state: 'hovered',
        attributes: PANEL_STATES.hovered.attributes
    });

    // "idle" state: when the panel is not interacted with.
    // Use onUnset to trigger the releasedAction when the panel leaves the "selected" state.
    container.setupState({
        state: 'idle',
        attributes: PANEL_STATES.idle.attributes,
        onSet: releasedAction.bind(container)  // Triggered when the panel exits a non-idle state.
    });

    // Set the container's position and a slight rotation for visual effect.
    container.position.set(x, y, z);
    container.rotation.x = PANEL_CONFIG.rotationX;

    return container;
}

/**
 * Creates a button with a label and an action callback.
 *
 * @param {string} label - The text to display on the button.
 * @param {Function} action - The callback function to execute on button selection.
 * @returns {ThreeMeshUI.Block} The configured button.
 */
export function makeButton(label, action) {
    // Instantiate the button using base options
    const button = new ThreeMeshUI.Block(BUTTON_OPTIONS);

    // Add the label as a child text element
    button.add(new ThreeMeshUI.Text({ content: label }));

    // Setup state for 'selected' with a callback on state change
    button.setupState({
        state: 'selected',
        attributes: BUTTON_STATES.selected.attributes,
        onSet: action
    });

    // Setup the 'hovered' and 'idle' states using the pre-defined configurations
    button.setupState({
        state: 'hovered',
        attributes: BUTTON_STATES.hovered.attributes
    });
    button.setupState({
        state: 'idle',
        attributes: BUTTON_STATES.idle.attributes
    });

    return button;
}
