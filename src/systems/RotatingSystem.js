import { System } from "three/examples/jsm/libs/ecsy.module.js";
import Object3D from "../components/Object3D.js";
import Rotating from "../tagcomponents/Rotating.js";

class RotatingSystem extends System {

    execute( delta/*, time*/ ) {

        this.queries.rotatingObjects.results.forEach( entity => {

            const object = entity.getComponent( Object3D ).object;
            object.rotation.x += 0.4 * delta;
            object.rotation.y += 0.4 * delta;

        } );

    }

}

RotatingSystem.queries = {
    rotatingObjects: {
        components: [ Rotating ]
    }
};

export default RotatingSystem;