declare enum Role {
    Harvester
}
interface Creep {
    _memory: CreepMemory
}
interface CreepMemory {
    role: Role
}