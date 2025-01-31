import * as THREE from 'three';
import Object3D from '../components/Object3D.js';  
import Rotating from '../tagcomponents/Rotating.js';

export function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101010); // Set background to dark

    // Lighting Setup
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

    // Create Video Element Dynamically
    const video = document.createElement('video');
    video.id = 'video';
    video.loop = true;
    video.muted = true;
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.style.display = 'none';

    // Add Video Sources
    const sourceWebM = document.createElement('source');
    sourceWebM.src = '/textures/MaryOculus.webm';
    sourceWebM.type = 'video/webm';

    const sourceMP4 = document.createElement('source');
    sourceMP4.src = '/textures/MaryOculus.mp4';
    sourceMP4.type = 'video/mp4';

    video.appendChild(sourceWebM);
    video.appendChild(sourceMP4);
    document.body.appendChild(video);
    // video.play();

    // Create Video Texture
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;

    // Left Eye Sphere
    const geometry1 = new THREE.SphereGeometry(500, 60, 40);
    geometry1.scale(-1, 1, 1);
    const uvs1 = geometry1.attributes.uv.array;

    for (let i = 0; i < uvs1.length; i += 2) {
        uvs1[i] *= 0.5;
    }

    const material1 = new THREE.MeshBasicMaterial({ map: texture });
    const mesh1 = new THREE.Mesh(geometry1, material1);
    mesh1.rotation.y = -Math.PI / 2;
    mesh1.layers.set(1); // Left eye only
    scene.add(mesh1);

    // Right Eye Sphere
    const geometry2 = new THREE.SphereGeometry(500, 60, 40);
    geometry2.scale(-1, 1, 1);
    const uvs2 = geometry2.attributes.uv.array;

    for (let i = 0; i < uvs2.length; i += 2) {
        uvs2[i] *= 0.5;
        uvs2[i] += 0.5;
    }

    const material2 = new THREE.MeshBasicMaterial({ map: texture });
    const mesh2 = new THREE.Mesh(geometry2, material2);
    mesh2.rotation.y = -Math.PI / 2;
    mesh2.layers.set(2); // Right eye only
    scene.add(mesh2);

    return { scene, video };
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