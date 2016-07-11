import {GameState} from "../game-state"
import {Strategy} from "./strategy"
import {Prospector} from "./../role/prospector"
import {EnergyMonitor} from "./../monitor/energy-monitor"
import {Role} from "./../role/role"
export type SpawnOrExtension = StructureSpawn | StructureExtension
export class StartStrategy implements Strategy {
    public state = GameState.Start;
    public prospectors: Prospector[];
    public sources: Source[];
    public containers: StructureContainer[];
    public spawningBuildings: SpawnOrExtension[];
    public constructor(public room: Room) {
        this.prospectors = this.room.find<Creep>(FIND_MY_CREEPS, { filter: { memory: { role: Role.Prospector } } }).map(creep => new Prospector(creep));
        this.sources = this.room.find<Source>(FIND_SOURCES);
        this.containers = this.room.find<StructureContainer>(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } });
        this.spawningBuildings = room.find<SpawnOrExtension>(FIND_MY_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION;
            }
        });
    }
    public execute() {
        this.manageProspectors();
    }
    public recommend() {
        if (this.room.energyCapacityAvailable <= 150 && this.containers.length < this.sources.length) {
            return 100
        } else {
            return 0
        }
    }
    public availableSources() {
        return this.sources.filter(source => {
            return !this.prospectors.some(prospector => prospector.memory.source == source.id) &&
                !this.room.find<Structure>(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } }).some(structure => structure.pos.isNearTo(source.pos))
        });
    }
    assignProspector(prospector: Prospector, source: Source) {
        
    }
    assignAssistant(prospector: Prospector, assistant: Prospector) {

    }
    manageMines() {

    }
    manageProspectors() {
        let availableSource = this.availableSources()[0];
        if (availableSource != null) {
            let spawn = _.find(Game.spawns, spawn => spawn.room.name == this.room.name);
            console.log(`selected spawn: ${spawn}`)
            if (spawn) {
                spawn.createCreep([WORK, CARRY, MOVE], undefined, {role: Role.Prospector, prospector: {source: availableSource.id, pos: null, assistants: [], site: null}});
            }
        }
        for (let prospector of this.prospectors) {
            prospector.setupSource();
        }
    }
}