import { System } from "three/examples/jsm/libs/ecsy.module.js";
import OffsetFromCamera from "../components/OffsetFromCamera.js";
import Object3D from "../components/Object3D.js";
import NeedCalibration from "../tagcomponents/NeedCalibration.js";

class CalibrationSystem extends System {

    init( attributes ) {

        this.camera = attributes.camera;
        this.renderer = attributes.renderer;

    }

    execute( /* delta, time */ ) {

        this.queries.needCalibration.results.forEach( entity => {

            if ( this.renderer.xr.getSession() ) {

                const offset = entity.getComponent( OffsetFromCamera );
                const object = entity.getComponent( Object3D ).object;
                const xrCamera = this.renderer.xr.getCamera();
                object.position.x = xrCamera.position.x + offset.x;
                object.position.y = xrCamera.position.y + offset.y;
                object.position.z = xrCamera.position.z + offset.z;
                entity.removeComponent( NeedCalibration );

            }

        } );

    }

}

CalibrationSystem.queries = {
    needCalibration: {
        components: [ NeedCalibration ]
    }
};

export default CalibrationSystem;