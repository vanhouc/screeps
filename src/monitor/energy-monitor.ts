/// <reference path="energy-monitor.d.ts" />
export namespace EnergyMonitor {
    export var historySize = 100;
    export function getRoomEnergy(room: Room) {
        let creepEnergy = room.find<Creep>(FIND_MY_CREEPS, {
            filter: (creep: Creep) => {
                return creep.carry[RESOURCE_ENERGY] > 0;
            }
        }).reduce((total, creep) => total + creep.carry[RESOURCE_ENERGY], 0);
        let usableEnergy = room.find<StructureExtension | StructureSpawn>(FIND_MY_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION;
            }
        }).reduce((total, structure) => total + structure.energy, 0);
        let storedEnergy = room.find<StructureContainer | StructureStorage>(FIND_MY_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE;
            }
        }).reduce((total, structure) => total + structure.store[RESOURCE_ENERGY], 0);
        return creepEnergy + usableEnergy + storedEnergy;
    }
    export function recordRoom(room: Room) {
        room._memory.energy.history.push(getRoomEnergy(room));
    }
    export function getRoomAverage(room: Room) {
        return Math.sqrt(room._memory.energy.history.reduce((total, historicalEnergy) => total * historicalEnergy, 1));
    }
    export function run() {
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            EnergyMonitor.recordRoom(room);
        }
    }
}