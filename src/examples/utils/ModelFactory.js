// ModelFactory.js
import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui';

// Import BoxLineGeometry from the Three.js examples (ensure your build setup supports this)
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import ShadowedLight from './ShadowedLight.js';

import FontJSON from '../assets/Roboto-msdf.json';
import FontImage from '../assets/Roboto-msdf.png';

// Create a wireframe room using BoxLineGeometry (translated upward by 3 units on Y)
const room = new THREE.LineSegments(
	new BoxLineGeometry(6, 6, 6, 10, 10, 10).translate(0, 3, 0),
	new THREE.LineBasicMaterial({ color: 0x808080 })
);

// Create a mesh for the room (using the inside faces only)
const roomMesh = new THREE.Mesh(
	new THREE.BoxGeometry(6, 6, 6, 10, 10, 10).translate(0, 3, 0),
	new THREE.MeshBasicMaterial({ side: THREE.BackSide })
);

// Create a shadowed directional light using your custom helper
const light = ShadowedLight({
	x: 2,
	y: 10,
	z: -2,
	width: 10,
	near: 0.1,
	far: 30,
	bias: 0,
	resolution: 2048,
	color: 0xffffff,
	intensity: 1,
	useHelpers: true, // Set to true to add visual helpers for debugging
	castShadow: true
});

const hemLight = new THREE.HemisphereLight( 0x808080, 0x606060 );

// Create a sphere mesh
export function makeSphere(container = null, radius = 0.3, detail = 1, color = 0x3de364) {
    const sphere = new THREE.Mesh(
        new THREE.IcosahedronGeometry(radius, detail),
        new THREE.MeshStandardMaterial({ color: color, flatShading: true })
    );
    
    if (container != null) {
        container.add(sphere);
    }
    
    return sphere;
}

// Create a sphere mesh
export function makeBox(container = null, width = 0.45, height = 0.45, depth = 0.45, color = 0x643de3) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshStandardMaterial({ color: color, flatShading: true })
    );
    
    if (container != null) {
        container.add(box);
    }
    
    return box;
}

// Create a sphere mesh
export function makeCone(container = null, radius = 0.28, height = 0.5, radialSegments = 10, color = 0xe33d4e) {
    const cone = new THREE.Mesh(
        new THREE.ConeGeometry(radius, height, radialSegments),
        new THREE.MeshStandardMaterial({ color: color, flatShading: true })
    );
    
    if (container != null) {
        container.add(cone);
    }
    
    return cone;
}

export function make360Video(scene) {
    // // Get the video element and create a texture from it.
    // const video = document.getElementById('video');
    // const texture = new THREE.VideoTexture(video);
    // texture.colorSpace = THREE.SRGBColorSpace;
  
    // // Left sphere: modify UVs so that the U component covers [0, 0.5]
    // createSphereMesh(scene, texture, uv => uv * 0.5, 1);
  
    // // Right sphere: modify UVs so that the U component covers [0.5, 1]
    // createSphereMesh(scene, texture, uv => uv * 0.5 + 0.5, 2);

    const video = document.getElementById( 'video' );
    
    const texture = new THREE.VideoTexture( video );
    texture.colorSpace = THREE.SRGBColorSpace;

    // left
    const geometry1 = new THREE.SphereGeometry( 500, 60, 40 );
    // invert the geometry on the x-axis so that all of the faces point inward
    geometry1.scale( - 1, 1, 1 );

    const uvs1 = geometry1.attributes.uv.array;

    for ( let i = 0; i < uvs1.length; i += 2 ) {

        uvs1[ i ] *= 0.5;

    }

    const material1 = new THREE.MeshBasicMaterial( { map: texture } );

    const mesh1 = new THREE.Mesh( geometry1, material1 );
    mesh1.rotation.y = - Math.PI / 2;
    mesh1.layers.set( 1 ); // display in left eye only
    scene.add( mesh1 );

    // right

    const geometry2 = new THREE.SphereGeometry( 500, 60, 40 );
    geometry2.scale( - 1, 1, 1 );

    const uvs2 = geometry2.attributes.uv.array;

    for ( let i = 0; i < uvs2.length; i += 2 ) {

        uvs2[ i ] *= 0.5;
        uvs2[ i ] += 0.5;

    }

    const material2 = new THREE.MeshBasicMaterial( { map: texture } );

    const mesh2 = new THREE.Mesh( geometry2, material2 );
    mesh2.rotation.y = - Math.PI / 2;
    mesh2.layers.set( 2 ); // display in right eye only
    scene.add( mesh2 );

    return video;
}

/**
 * Helper function to create a sphere mesh with modified UVs.
 *
 * @param {THREE.Scene} scene - The scene.
 * @param {THREE.Texture} texture - A texture.
 * @param {function(number): number} uvModifier - A function to modify the U component.
 * @param {number} layer - The layer on which the mesh should be rendered.
 * @returns {THREE.Mesh} The created sphere mesh.
 */
const createSphereMesh = (scene, texture, uvModifier, layer) => {
    // Common sphere parameters
    const radius = 500;
    const widthSegments = 60;
    const heightSegments = 40;
    
    // Create the sphere geometry.
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    // Invert the geometry on the x-axis so that all faces point inward.
    geometry.scale(-1, 1, 1);

    // Modify the U component of each UV coordinate.
    const uvs = geometry.attributes.uv.array;
    for (let i = 0; i < uvs.length; i += 2) {
        uvs[i] = uvModifier(uvs[i]);
    }

    // Create a basic material using the video texture.
    const material = new THREE.MeshBasicMaterial({ map: texture });
    // Create the mesh.
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = -Math.PI / 2;
    mesh.layers.set(layer);
    // Add the mesh to the scene.
    scene.add(mesh);

    return mesh;
};

export function makeUIPanel() {

	// Container block, in which we put the two buttons.
	// We don't define width and height, it will be set automatically from the children's dimensions
	// Note that we set contentDirection: "row-reverse", in order to orient the buttons horizontally

	const container = new ThreeMeshUI.Block( {
		justifyContent: 'center',
		contentDirection: 'row-reverse',
		fontFamily: FontJSON,
		fontTexture: FontImage,
		fontSize: 0.07,
		padding: 0.02,
		borderRadius: 0.11
	} );

	container.position.set( 0, 0.6, -1.2 );
	container.rotation.x = -0.55;
    return container;
}

export function makeButton(label, action)
{
    // BUTTONS

    // We start by creating objects containing options that we will use with the two buttons,
    // in order to write less code.

    const buttonOptions = {
        width: 0.4,
        height: 0.15,
        justifyContent: 'center',
        offset: 0.05,
        margin: 0.02,
        borderRadius: 0.075
    };

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
            backgroundColor: new THREE.Color( 0x999666 ),
            backgroundOpacity: 0.3,
            fontColor: new THREE.Color( 0xffffff )
        },
    };

    // Buttons creation, with the options objects passed in parameters.

    const button = new ThreeMeshUI.Block( buttonOptions );

    // Add text to buttons

    button.add(
        new ThreeMeshUI.Text( { content: label } )
    );

    // Create states for the buttons.
    // In the loop, we will call component.setState( 'state-name' ) when mouse hover or click

    const selectedAttributes = {
        offset: 0.02,
        backgroundColor: new THREE.Color( 0x777777 ),
        fontColor: new THREE.Color( 0x222222 )
    };

    button.setupState( {
        state: 'selected',
        attributes: selectedAttributes,
        onSet: action
    } );
    button.setupState( hoveredStateAttributes );
    button.setupState( idleStateAttributes );

    return button;
}

// Group all objects together for easy scene management
const modelGroup = new THREE.Group();
modelGroup.add(room);
modelGroup.add(roomMesh);
modelGroup.add(light);
if (light.helpers.children.length > 0) {
	modelGroup.add(light.helpers);
}

// Export individual objects and the group for use in other modules
export { room, roomMesh, light, hemLight, modelGroup };
export default { room, roomMesh, light, hemLight, modelGroup };
