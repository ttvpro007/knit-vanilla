import { Component, Types } from "three/examples/jsm/libs/ecsy.module.js";

export default class Draggable extends Component { }

Draggable.schema = {
    // draggable states: [detached, hovered, to-be-attached, attached, to-be-detached]
    state: { type: Types.String, default: 'none' },
    originalParent: { type: Types.Ref, default: null },
    attachedPointer: { type: Types.Ref, default: null }
};