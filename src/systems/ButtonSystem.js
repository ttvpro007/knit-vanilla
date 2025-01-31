import { System } from 'three/addons/libs/ecsy.module.js';
import { Button } from '../components/Button.js'
import Object3D from '../components/Object3D.js'

export default class ButtonSystem extends System {

    execute( /* delta, time */ ) {

        this.queries.buttons.results.forEach( entity => {

            const button = entity.getMutableComponent( Button );
            const buttonMesh = entity.getComponent( Object3D ).object;
            if ( button.currState == 'none' ) {

                buttonMesh.scale.set( 1, 1, 1 );

            } else {

                buttonMesh.scale.set( 1.1, 1.1, 1.1 );

            }

            if ( button.currState == 'pressed' && button.prevState != 'pressed' ) {

                button.action();

            }

            // preserve prevState, clear currState
            // HandRaySystem will update currState
            button.prevState = button.currState;
            button.currState = 'none';

        } );

    }

}

ButtonSystem.queries = {
    buttons: {
        components: [ Button ]
    }
};
