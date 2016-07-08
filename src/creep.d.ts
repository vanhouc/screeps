interface Creep {
    _memory(): CreepMemory;
    travelTo(path: {path: RoomPosition[], ops: number});
}
interface CreepMemory {
    path: { path: RoomPosition[], ops: number };
}