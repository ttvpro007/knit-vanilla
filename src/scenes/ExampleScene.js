import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import world from '../helpers/World.js';
import { setupController, setupControllerGrip, setupHand, setupHandPointer } from '../helpers/Controllers.js';
import { createFloor, createMenu, createButton, createInstructionText } from '../helpers/UI.js';

import ButtonSystem from '../systems/ButtonSystem.js';
import HandRaySystem from '../systems/HandRaySystem.js';
import RotatingSystem from '../systems/RotatingSystem.js';
import InstructionSystem from '../systems/InstructionSystem.js';
import CalibrationSystem from '../systems/CalibrationSystem.js';

export default class ExampleScene {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        this.renderer.xr.cameraAutoUpdate = false;
        this.clock = new THREE.Clock();

        this.container.appendChild(this.renderer.domElement);
        this.container.appendChild(VRButton.createButton(this.renderer));

        this.initScene();
        this.initControllers();
        this.initWorld(); // Register ECSY systems *after* initialization

        this.animate();
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    initScene() {
        this.scene.background = new THREE.Color(0x444444);
        this.scene.add(new THREE.HemisphereLight(0xcccccc, 0x999999, 3));

        const light = new THREE.DirectionalLight(0xffffff, 3);
        light.position.set(0, 6, 0);
        light.castShadow = true;
        this.scene.add(light);

        createFloor(this.scene);
        this.menu = createMenu(this.scene);

        createInstructionText(this.scene, "This is a WebXR Hands demo, please explore with hands.", [0, 1.6, -0.6]);
    }

    initControllers() {
        // Setup left-hand (index 0)
        this.controller1 = setupController(this.renderer, this.scene, 0);
        this.controllerGrip1 = setupControllerGrip(this.renderer, this.scene, 0);
        this.hand1 = setupHand(this.renderer, this.scene, 0);
        this.handPointer1 = setupHandPointer(this.hand1, this.controller1);

        // Setup right-hand (index 1)
        this.controller2 = setupController(this.renderer, this.scene, 1);
        this.controllerGrip2 = setupControllerGrip(this.renderer, this.scene, 1);
        this.hand2 = setupHand(this.renderer, this.scene, 1);
        this.handPointer2 = setupHandPointer(this.hand2, this.controller2);
    }

    initWorld() {
        createButton(this.menu, "Start", 0x00ff00, 0.1, () => console.log("Start pressed"), world);

        // Now that controllers & pointers are initialized, we can safely register systems
        world
            .registerSystem(RotatingSystem)
            .registerSystem(InstructionSystem, { controllers: [this.controllerGrip1, this.controllerGrip2] })
            .registerSystem(CalibrationSystem, { renderer: this.renderer, camera: this.camera })
            .registerSystem(ButtonSystem)
            .registerSystem(HandRaySystem, { handPointers: [this.handPointer1, this.handPointer2] });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        this.renderer.setAnimationLoop(() => {
            const delta = this.clock.getDelta();
            const elapsedTime = this.clock.elapsedTime;

            this.renderer.xr.updateCamera(this.camera);
            world.execute(delta, elapsedTime);
            this.renderer.render(this.scene, this.camera);
        });
    }
}
