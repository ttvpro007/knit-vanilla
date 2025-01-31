import { System } from "three/examples/jsm/libs/ecsy.module.js";
import Draggable from "../components/Draggable";
import Object3D from "../components/Object3D";

export default class DraggableSystem extends System {

    execute( /*delta, time*/ ) {

        this.queries.draggable.results.forEach( entity => {

            const draggable = entity.getMutableComponent( Draggable );
            const object = entity.getComponent( Object3D ).object;
            if ( draggable.originalParent == null ) {

                draggable.originalParent = object.parent;

            }

            switch ( draggable.state ) {

                case 'to-be-attached':
                    draggable.attachedPointer.children[ 0 ].attach( object );
                    draggable.state = 'attached';
                    break;
                case 'to-be-detached':
                    draggable.originalParent.attach( object );
                    draggable.state = 'detached';
                    break;
                default:
                    object.scale.set( 1, 1, 1 );

            }

        } );

    }

}

DraggableSystem.queries = {
    draggable: {
        components: [ Draggable ]
    }
};