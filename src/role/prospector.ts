/// <reference path="prospector.d.ts" />
import {Role} from "./role"
export class Prospector {
    public creep: Creep;
    public get memory(): ProspectorCreepMemory {
        return this.creep._memory().prospector;
    }
    public constructor(creep: Creep) {
        this.creep = creep;
        this.creep._memory().role = Role.Prospector;
        if (this.memory == null) {
            this.creep._memory().prospector = {
                assistants: [],
                pos: null,
                site: undefined,
                source: null
            }
        }
        //If there is no pos then find a spot to setup next to the source
        if (this.memory.pos == null && this.memory.source != null) {
            let path = this.creep.pos.findPathToClosest(Game.getObjectById<Source>(this.memory.source));
            if (path.path.length > 0) {
                this.memory.pos = path.path[path.path.length - 1];
                this.creep._memory().path = path;
            } else {
                console.log(`${this.creep.name} cannot find anywhere to setup a container near ${this.memory.source}`);
            }
        }
    }
    public setupSource() {
        let pos = new RoomPosition(this.memory.pos.x, this.memory.pos.y, this.memory.pos.roomName);
        if (this.memory.site == null) {
            let site = pos.lookFor<ConstructionSite>(LOOK_CONSTRUCTION_SITES)[0];
            if (site == null) {
                return pos.createConstructionSite(STRUCTURE_CONTAINER);
            } else {
                this.memory.site = site.id;
            }
        }
        let site = Game.getObjectById<ConstructionSite>(this.memory.site)
        if (this.creep.pos.isEqualTo(site.pos)) {
            if (this.creep.carry[RESOURCE_ENERGY] > 10) {
                this.creep.build(site);
            }
            return this.creep.harvest(Game.getObjectById<Source>(this.memory.source));
        } else {
            if (this.creep._memory().path == null || this.creep._memory().path.path.length < 1) {
                this.creep._memory().path = this.creep.pos.findPathToClosest(site);
            } else {
                this.creep.travelByPath()
            }
        }
    }
    public assist() {

    }
    public getPathToSource(source: Source) {
        let takenSourcePos = source.room.find<Creep>(FIND_MY_CREEPS, {
            filter: (creep: Creep) => {
                return creep._memory().role == Role.Prospector &&
                    creep._memory().prospector.source == source.id &&
                    creep._memory().prospector.pos != null
            }
        }).map(creep => creep._memory().prospector.pos);
        //Add nearby containers to list of unpathable
        //because we would not be able to build there
        takenSourcePos.concat(source.room.find<Structure>(FIND_CONSTRUCTION_SITES, { filter: { structureType: STRUCTURE_CONTAINER } })
            .filter(structure => structure.pos.isNearTo(source.pos))
            .map(structure => structure.pos));
        takenSourcePos.concat(source.room.find<Structure>(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } })
            .filter(structure => structure.pos.isNearTo(source.pos))
            .map(constructionSite => constructionSite.pos));
        let matrix = source.room.getCostMatrix();
        for (let pos of takenSourcePos) {
            matrix.set(pos.x, pos.y, 255);
        }
        return PathFinder.search(this.creep.pos, { pos: source.pos, range: 1 }, {
            roomCallback: roomName => {
                return source.room.name == roomName ? matrix : new PathFinder.CostMatrix();
            }
        });
    }
}