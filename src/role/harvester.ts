/// <reference path="harvester.d.ts" />
export interface HarvesterInterface {
    creep: Creep;

    getHarvesters(): HarvesterInterface[];
    tryHarvest(target: Source): number;
}
/**
 * Wraps a creep with harvesting functionality
 */
export class Harvester implements HarvesterInterface {
    public creep: Creep = null;
    get source(): Source {
        return Game.getObjectById<Source>(this.creep._memory.harvester.source)
    }
    set source(newSource) {
        if (newSource == null) return;
        this.creep._memory.harvester.source = newSource.id;
    }
    public constructor(creep: Creep) {
        this.creep = creep;
        if (this.creep._memory.role != Role.Harvester) {
            this.creep._memory.role = Role.Harvester;
        }
        if (this.creep._memory.harvester == null) {
            this.creep._memory.harvester = { source: null };
        }
    }
    public setCreep(creep: Creep) {
        this.creep = creep;
    }
    public getHarvesters() {
        return _.map(Game.creeps, creep => new Harvester(creep)) as Harvester[];
    }
    public tryHarvest(): number {
        if (this.creep.pos.isNearTo(this.source.pos))
            return this.creep.harvest(this.source);
        else
            return this.creep.moveTo(this.source);
    }
}