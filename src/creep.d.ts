declare enum Role {
    Harvester,
    Prospector
}
interface Creep {
    _memory: CreepMemory
}
interface CreepMemory {
    role: Role;
    path: RoomPosition[];
}