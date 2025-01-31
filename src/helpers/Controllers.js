import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { OculusHandModel } from 'three/addons/webxr/OculusHandModel.js';
import { OculusHandPointerModel } from 'three/addons/webxr/OculusHandPointerModel.js';

export function setupController(renderer, scene, index) {
    const controller = renderer.xr.getController(index);
    scene.add(controller);
    return controller;
}

export function setupControllerGrip(renderer, scene, index) {
    const controllerGrip = renderer.xr.getControllerGrip(index);
    const controllerModelFactory = new XRControllerModelFactory();
    controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip));
    scene.add(controllerGrip);
    return controllerGrip;
}

export function setupHand(renderer, scene, index) {
    const hand = renderer.xr.getHand(index);
    hand.add(new OculusHandModel(hand));
    scene.add(hand);
    return hand;
}

export function setupHandPointer(hand, controller) {
    const handPointer = new OculusHandPointerModel(hand, controller);
    hand.add(handPointer);
    return handPointer;
}
