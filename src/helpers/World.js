import { World } from 'three/addons/libs/ecsy.module.js';
import Object3D from '../components/Object3D.js';
import { Button } from '../components/Button.js';
import Intersectable from '../tagcomponents/Intersectable.js';
import Rotating from '../tagcomponents/Rotating.js';
import HandsInstructionText from '../tagcomponents/HandsInstructionText.js';
import OffsetFromCamera from '../components/OffsetFromCamera.js';
import NeedCalibration from '../tagcomponents/NeedCalibration.js';
import ButtonSystem from '../systems/ButtonSystem.js';
import HandRaySystem from '../systems/HandRaySystem.js';
import RotatingSystem from '../systems/RotatingSystem.js';
import InstructionSystem from '../systems/InstructionSystem.js';
import CalibrationSystem from '../systems/CalibrationSystem.js';
import Draggable from '../components/Draggable.js';
import DraggableSystem from '../systems/DraggableSystem.js';

export function setupWorld(renderer, camera, controllerGrips, handPointers) {
    const world = new World();

    world
        .registerComponent(Object3D)
        .registerComponent(Button)
        .registerComponent(Intersectable)
        .registerComponent(Rotating)
        .registerComponent(HandsInstructionText)
        .registerComponent(OffsetFromCamera)
        .registerComponent(Draggable)
        .registerComponent(NeedCalibration);

    world
        .registerSystem(RotatingSystem)
        .registerSystem(InstructionSystem, { controllerGrips: controllerGrips })
        .registerSystem(CalibrationSystem, { renderer, camera })
        .registerSystem(ButtonSystem)
        .registerSystem(DraggableSystem)
        .registerSystem(HandRaySystem, { handPointers: handPointers });

    return world;
}
