interface Creep {
    _memory(): CreepMemory
}
interface CreepMemory {
    path: { path: RoomPosition[], ops: number };
}