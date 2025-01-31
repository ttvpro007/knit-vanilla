import * as THREE from "three";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { OculusHandModel } from "three/examples/jsm/webxr/OculusHandModel.js";
import { OculusHandPointerModel } from "three/examples/jsm/webxr/OculusHandPointerModel.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

let scene, camera, renderer;
let video, videoTexture;
let controller1, controller2;
let buttons = [];
let timeDisplay;

// Initialize Scene
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 2);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Setup WebXR Controllers
    setupControllers();

    // Create Environment
    createFloor();
    createMenu();
    createVideoScreen();
    createTimeDisplay();

    // Start rendering loop
    renderer.setAnimationLoop(() => renderer.render(scene, camera));
}

// Setup controllers
function setupControllers() {
    controller1 = renderer.xr.getController(0);
    controller2 = renderer.xr.getController(1);
    scene.add(controller1, controller2);

    const controllerGrip1 = renderer.xr.getControllerGrip(0);
    const controllerGrip2 = renderer.xr.getControllerGrip(1);
    const modelFactory = new XRControllerModelFactory();
    controllerGrip1.add(modelFactory.createControllerModel(controllerGrip1));
    controllerGrip2.add(modelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip1, controllerGrip2);
}

// Create floor
function createFloor() {
    const geometry = new THREE.PlaneGeometry(4, 4);
    const material = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
}

// Create video screen
function createVideoScreen() {
    video = document.createElement("video");
    video.src = "/textures/MaryOculus.mp4";
    video.load();
    videoTexture = new THREE.VideoTexture(video);

    const geometry = new THREE.PlaneGeometry(2, 1);
    const material = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide });

    const screen = new THREE.Mesh(geometry, material);
    screen.position.set(0, 1.5, -2);
    scene.add(screen);
}

// Create menu panel and buttons
function createMenu() {
    const menuGeometry = new THREE.PlaneGeometry(0.5, 0.5);
    const menuMaterial = new THREE.MeshPhongMaterial({ opacity: 0, transparent: true });
    const menuMesh = new THREE.Mesh(menuGeometry, menuMaterial);
    menuMesh.position.set(0.4, 1, -1);
    menuMesh.rotation.y = -Math.PI / 12;
    scene.add(menuMesh);

    buttons.push(createButton(menuMesh, "Play/Pause", 0xffd3b5, 0.18, togglePlayPause));
    buttons.push(createButton(menuMesh, "Stop", 0xe84a5f, 0.06, stopMedia));
    buttons.push(createButton(menuMesh, "Rewind", 0x355c7d, -0.06, () => seekTime(-3)));
    buttons.push(createButton(menuMesh, "Forward", 0xff0000, -0.18, () => seekTime(3)));
}

// Create a 3D button
function createButton(menu, label, color, position, action) {
    const button = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.1, 0.01),
        new THREE.MeshPhongMaterial({ color })
    );
    button.position.set(0, position, 0);
    menu.add(button);

    // Load font for text
    const fontLoader = new FontLoader();
    fontLoader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", (font) => {
        const textGeometry = new TextGeometry(label, {
            font: font,
            size: 0.03,
            depth: 0.005,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-0.08, -0.02, 0.005);
        button.add(textMesh);
    });

    button.userData.action = action;
    return button;
}

// Create time display
function createTimeDisplay() {
    const fontLoader = new FontLoader();
    fontLoader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", (font) => {
        const textGeometry = new TextGeometry("00:00", {
            font: font,
            size: 0.04,
            depth: 0.005,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        timeDisplay = new THREE.Mesh(textGeometry, textMaterial);
        timeDisplay.position.set(0, 1.6, -0.6);
        scene.add(timeDisplay);
    });

    video.addEventListener("timeupdate", updateTime);
}

// Update video time
function updateTime() {
    const minutes = Math.floor(video.currentTime / 60).toString().padStart(2, "0");
    const seconds = Math.floor(video.currentTime % 60).toString().padStart(2, "0");

    const fontLoader = new FontLoader();
    fontLoader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", (font) => {
        const textGeometry = new TextGeometry(`${minutes}:${seconds}`, {
            font: font,
            size: 0.04,
            depth: 0.005,
        });
        timeDisplay.geometry.dispose();
        timeDisplay.geometry = textGeometry;
    });
}

// Handle button interactions
function handleIntersections(controller) {
    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();

    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(controller.matrixWorld);

    const intersects = raycaster.intersectObjects(buttons);
    if (intersects.length > 0) {
        const button = intersects[0].object;
        if (button.userData.action) {
            button.userData.action();
        }
    }
}

// Add event listener for controllers
controller1?.addEventListener("selectstart", () => handleIntersections(controller1));
controller2?.addEventListener("selectstart", () => handleIntersections(controller2));

// Toggle play/pause
function togglePlayPause() {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

// Stop video
function stopMedia() {
    video.pause();
    video.currentTime = 0;
}

// Seek video
function seekTime(seconds) {
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration));
}

// Resize handler
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

export default function VideoPlayer() {
    // Start WebXR
    init(); // Calls the Three.js WebXR video player setup
}

