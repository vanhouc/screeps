interface CreepMemory {
    prospector: ProspectorCreepMemory
}
interface ProspectorCreepMemory {
    source: string,
    pos: RoomPosition,
    site: string,
    assistants: string[]
}