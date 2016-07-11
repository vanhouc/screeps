interface Creep {
    _memory(): CreepMemory;
    travelByPath(): number;
}
interface CreepMemory {
    path: { path: RoomPosition[], ops: number };
    ticksBlocked: number;
    lastPos: RoomPosition;
}