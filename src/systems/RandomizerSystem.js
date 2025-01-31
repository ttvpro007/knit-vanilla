import { System } from "three/examples/jsm/libs/ecsy.module.js";
import Randomizable from "../tagcomponents/Randomizable";
import Object3D from "../components/Object3D";

export default class RandomizerSystem extends System {

    init( /*attributes*/ ) {

        this.needRandomizing = true;

    }

    execute( /*delta, time*/ ) {

        if ( ! this.needRandomizing ) {

            return;

        }

        this.queries.randomizable.results.forEach( entity => {

            const object = entity.getComponent( Object3D ).object;

            object.material.color.setHex( Math.random() * 0xffffff );

            object.position.x = Math.random() * 2 - 1;
            object.position.y = Math.random() * 2;
            object.position.z = Math.random() * 2 - 1;

            object.rotation.x = Math.random() * 2 * Math.PI;
            object.rotation.y = Math.random() * 2 * Math.PI;
            object.rotation.z = Math.random() * 2 * Math.PI;

            object.scale.x = Math.random() + 0.5;
            object.scale.y = Math.random() + 0.5;
            object.scale.z = Math.random() + 0.5;
            this.needRandomizing = false;

        } );

    }

}

RandomizerSystem.queries = {
    randomizable: {
        components: [ Randomizable ]
    }
};