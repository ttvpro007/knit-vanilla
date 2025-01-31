import { World, System } from 'three/addons/libs/ecsy.module.js';
import Object3D from '../components/Object3D.js';
import { Button } from '../components/Button.js';
import Intersectable from '../tagcomponents/Intersectable.js';
import Rotating from '../tagcomponents/Rotating.js';
// import HandsInstructionText from '../tagcomponents/HandsInstructionText.js';
import OffsetFromCamera from '../components/OffsetFromCamera.js';
import NeedCalibration from '../tagcomponents/NeedCalibration.js';
import ButtonSystem from '../systems/ButtonSystem.js';
import RotatingSystem from '../systems/RotatingSystem.js';
// import InstructionSystem from '../systems/InstructionSystem.js';
import CalibrationSystem from '../systems/CalibrationSystem.js';
import Draggable from '../components/Draggable.js';
import DraggableSystem from '../systems/DraggableSystem.js';

class HandRaySystem extends System {
    init( attributes ) {
        this.handPointers = attributes.handPointers;
    }

    execute( /*delta, time*/ ) {
        this.handPointers.forEach( hp => {
            let distance = null;
            let intersectingEntity = null;
            this.queries.intersectable.results.forEach( entity => {
                const object = entity.getComponent( Object3D ).object;
                const intersections = hp.intersectObject( object, false );
                if ( intersections && intersections.length > 0 ) {
                    if ( distance == null || intersections[ 0 ].distance < distance ) {
                        distance = intersections[ 0 ].distance;
                        intersectingEntity = entity;
                    }
                }
            });

            if ( distance ) {
                hp.setCursor( distance );
                if ( intersectingEntity.hasComponent( Button ) ) {
                    const button = intersectingEntity.getMutableComponent( Button );
                    if ( hp.isPinched() ) {
                        button.currState = 'pressed';
                    } else if ( button.currState != 'pressed' ) {
                        button.currState = 'hovered';
                    }
                }

                if ( intersectingEntity.hasComponent( Draggable ) ) {
                    const draggable = intersectingEntity.getMutableComponent( Draggable );
                    const object = intersectingEntity.getComponent( Object3D ).object;
                    object.scale.set( 1.1, 1.1, 1.1 );
                    if ( hp.isPinched() ) {
                        if ( ! hp.isAttached() && draggable.state != 'attached' ) {
                            draggable.state = 'to-be-attached';
                            draggable.attachedPointer = hp;
                            hp.setAttached( true );
                        }
                    } else {
                        if ( hp.isAttached() && draggable.state == 'attached' ) {
                            console.log( 'hello' );
                            draggable.state = 'to-be-detached';
                            draggable.attachedPointer = null;
                            hp.setAttached( false );
                        }
                    }
                }
            } else {
                hp.setCursor( 1.5 );
            }
        } );
    }
}

HandRaySystem.queries = {
    intersectable: {
        components: [ Intersectable ]
    }
};

export function setupWorld(renderer, camera, controllerGrips, handPointers) {
    const world = new World();

    world
        .registerComponent(Object3D)
        .registerComponent(Button)
        .registerComponent(Intersectable)
        .registerComponent(Rotating)
        // .registerComponent(HandsInstructionText)
        .registerComponent(OffsetFromCamera)
        .registerComponent(Draggable)
        .registerComponent(NeedCalibration);

    world
        .registerSystem(RotatingSystem)
        // .registerSystem(InstructionSystem, { controllerGrips: controllerGrips })
        .registerSystem(CalibrationSystem, { renderer, camera })
        .registerSystem(ButtonSystem)
        .registerSystem(DraggableSystem)
        .registerSystem(HandRaySystem, { handPointers: handPointers });

    return world;
}
