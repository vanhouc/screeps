import {Strategy} from "strategy"
import {Harvester} from "./../role/harvester"
import {EnergyMonitor} from "./../monitor/energy-monitor"
export type SpawnOrExtension = StructureSpawn | StructureExtension
export class EarlyStrategy implements Strategy {

    public harvesters: Harvester[];
    public sources: Source[];
    public containers: StructureContainer[];
    public spawningBuildings: SpawnOrExtension[];
    public constructor(public room: Room) {
        this.harvesters = this.room.find<Creep>(FIND_MY_CREEPS, { filter: { memory: { role: 'harvester' } } }).map(creep => new Harvester(creep));
        this.sources = this.room.find<Source>(FIND_SOURCES);
        this.containers = this.room.find<StructureContainer>(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } });
        this.spawningBuildings = room.find<SpawnOrExtension>(FIND_MY_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION;
            }
        });
    }
    public execute() {
        return;
    }
    public recommend() {
        if (this.room.energyCapacityAvailable <= 150) {
            return 100
        } else {
            return 0
        }
    }
    manageHarvesters() {
        for (let harvester of this.harvesters) {
            if (harvester.source == null) {
                harvester.creep._memory.harvester.source
            }
            if (_.sum(harvester.creep.carry as any) < harvester.creep.carryCapacity) {
                harvester.tryHarvest();
            } else {
                let dropOff = this.spawningBuildings.filter(energyBuilding => energyBuilding.)
            }
        }
    }
}