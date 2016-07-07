/// <reference path="prospector.d.ts" />
export class Prospector {
    public creep: Creep;
    public get memory(): ProspectorCreepMemory {
        return this.creep._memory.prospector;
    }
    public constructor(creep: Creep) {
        this.creep = creep;
        this.creep._memory.role = Role.Prospector;
        if (this.memory == null) {
            this.creep._memory.prospector = {
                assistants: [],
                pos: null,
                site: null,
                source: null
            }
        }
        //If there is no pos then find a spot to setup next to the source
        if (this.memory.pos == null && this.memory.source != null) {
            let path = this.getPathToSource(Game.getObjectById<Source>(this.memory.source));
            if (path.path.length > 0) {
                this.memory.pos = path.path[path.path.length - 1];
                this.creep._memory.path = path.path;
            } else {
                console.log(`${this.creep.name} cannot find anywhere to setup a container near ${this.memory.source}`);
            }
        }
    }
    public setupSource() {
        if (this.creep.pos.isEqualTo(this.memory.pos)) {
            if (this.memory.site == null) {
                return this.memory.pos.createConstructionSite(STRUCTURE_CONTAINER);
            } else {
                return this.creep.harvest(Game.getObjectById<Source>(this.memory.source))
            }
        } else {
            if (this.creep._memory.path == null || this.creep._memory.path.length < 1) {
            }
        }
    }
    public assist() {

    }
    public getPathToSource(source: Source) {
        let takenSourcePos = source.room.find<Creep>(FIND_MY_CREEPS, {
            filter: (creep: Creep) => {
                return creep._memory.role == Role.Prospector &&
                    creep._memory.prospector.source == source.id &&
                    creep._memory.prospector.pos != null
            }
        }).map(creep => creep._memory.prospector.pos);
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