export enum Role {
    Prospector,
    Harvester
}
declare global {
    interface CreepMemory {
        role: Role
    }
}