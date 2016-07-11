import {GameState} from "./game-state";
import {EnergyMonitor} from "./monitor/energy-monitor"
import {StartStrategy} from "./strategy/start"

/**
 * Singleton object.
 * Since singleton classes are considered anti-pattern in Typescript, we can effectively use namespaces.
 * Namespace's are like internal modules in your Typescript application. Since GameManager doesn't need multiple instances
 * we can use it as singleton.
 */
export namespace GameManager {

    /**
     * We can use variables in our namespaces in this way. Since GameManager is not class, but "module", we have to export the var, so we could use it.
     * @type {string}
     */
    export var sampleVariable: string = "This is public variable";
    export var state: GameState = GameState.Start;
    export function isRoomPosition(x: any): x is RoomPosition {
        return (<RoomPosition>x) instanceof RoomPosition;
    }
    export function isRoomObject(x: any): x is RoomObject {
        return (<RoomObject>x).pos !== undefined &&
            (<RoomObject>x).room !== undefined;
    }
    export function isRoomObjectArray(x: any): x is RoomObject[] {
        return (<RoomObject[]>x).every(obj => obj.pos !== undefined);
    }
    export function globalBootstrap() {
        // Set up your global objects.
        // This method is executed only when Screeps system instantiated new "global".

        // Use this bootstrap wisely. You can cache some of your stuff to save CPU
        // You should extend prototypes before game loop in here.
        console.log("This method is only run when new global is created by Screeps cycle");
        sampleVariable = "This is how you can use variables in GameManager";
        Room.prototype._memory = function () {
            let that = this as Room;
            return that.memory as RoomMemory;
        }
        RoomPosition.prototype.isWalkable = function () {
            let that = this as RoomPosition;
            let posObjects = that.look();
            return !posObjects.some(obj => {
                if (obj.constructionSite !== undefined &&
                    obj.constructionSite.structureType !== STRUCTURE_ROAD &&
                    obj.constructionSite.structureType !== STRUCTURE_CONTAINER &&
                    obj.constructionSite.structureType !== STRUCTURE_RAMPART) {
                    return true;
                }
                if (obj.structure !== undefined &&
                    obj.structure.structureType !== STRUCTURE_ROAD &&
                    obj.structure.structureType !== STRUCTURE_CONTAINER &&
                    obj.structure.structureType !== STRUCTURE_RAMPART) {
                    return true;
                }
                if (obj.terrain !== 'normal' && obj.terrain !== 'swamp') {
                    return true;
                }
                return false;
            });
        }
        RoomPosition.prototype.findPathToClosest = function (goal: RoomObject | RoomObject[]) {
            let pos = this as RoomPosition;
            let goals: (RoomObject & { range: number })[] = [];
            if (Array.isArray(goal)) {
                goals = goal.map(roomObj => Object.assign(roomObj, { range: roomObj.pos.isWalkable() ? 0 : 1 }));
            } else {
                goals = [Object.assign(goal, { range: goal.pos.isWalkable() ? 0 : 1 })]
            }
            console.log(`goal is located at ${goals[0].pos}`);
            let newPath = PathFinder.search(pos, goals, {
                roomCallback: function (roomName) {
                    let room = Game.rooms[roomName];
                    return room === undefined ? new PathFinder.CostMatrix() : room.getCostMatrix();
                }
            });
            //If multiple goals were submitted return the goal being pathed to
            if (Array.isArray(goal))
                return Object.assign(newPath, { target: _.find(goal, roomObj => newPath.path[newPath.path.length - 1].isNearTo(roomObj)) });
            else
                return Object.assign(newPath, { target: goal });

        }
        Creep.prototype._memory = function () {
            let that = this as Creep;
            return that.memory as CreepMemory;
        }
        Creep.prototype.travelByPath = function () {
            let creep = this as Creep;
            let memory = creep._memory();
            let path = memory.path;
            if (path === undefined || path.path.length < 1) return ERR_NOT_FOUND
            if (memory.lastPos === undefined) memory.lastPos = creep.pos;
            //Handle blocked path
            if (creep.pos.isEqualTo(memory.lastPos.x, memory.lastPos.y)) {
                if (memory.ticksBlocked === undefined) memory.ticksBlocked = 0;
                memory.ticksBlocked++;
                if (memory.ticksBlocked > 5) {
                    delete memory.path;
                    memory.ticksBlocked = 0;
                    return ERR_NO_PATH;
                }
            } else {
                memory.ticksBlocked = 0;
            }

            memory.lastPos = creep.pos;
            for (let i = 0; i < path.path.length - 1; i++) {
                if (creep.pos.isEqualTo(path.path[i].x, path.path[i].y)) {
                    if (i + 1 >= path.path.length) {
                        delete creep._memory().path;
                        return 0;
                    } else {
                        return creep.move(creep.pos.getDirectionTo(new RoomPosition(path.path[i + 1].x, path.path[i + 1].y, path.path[i + 1].roomName)));
                    }
                }
            }
            if (creep.pos.isNearTo(path.path[0].x, path.path[0].y)) {
                return creep.move(creep.pos.getDirectionTo(new RoomPosition(path.path[0].x, path.path[0].y, path.path[0].roomName)));
            }
            console.log('oh shit we should not be here');
        }
        Room.prototype.getCostMatrix = function (addCreeps = false) {
            //damnit typescript
            let that = this as Room;
            let structurePos = that.find<Structure>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType != STRUCTURE_CONTAINER &&
                        structure.structureType != STRUCTURE_ROAD &&
                        structure.structureType != STRUCTURE_RAMPART
                }
            }).map(structure => structure.pos);
            structurePos.concat(that.find<Structure>(FIND_CONSTRUCTION_SITES, {
                filter: (constructionSite: Structure) => {
                    return constructionSite.structureType != STRUCTURE_CONTAINER &&
                        constructionSite.structureType != STRUCTURE_ROAD &&
                        constructionSite.structureType != STRUCTURE_RAMPART
                }
            }).map(structure => structure.pos));
            if (addCreeps) {
                structurePos.concat(that.find<Creep>(FIND_CREEPS).map(creep => creep.pos));
            }
            let matrix = new PathFinder.CostMatrix();
            for (let unwalkablePos of structurePos) {
                matrix.set(unwalkablePos.x, unwalkablePos.y, 255)
            }
            return matrix;
        }
    }

    export function loop() {
        for (let creepName in Memory.creeps) {
            if (Game.creeps[creepName] == null) {
                delete Memory.creeps[creepName];
            }
        }
        // Loop code starts here
        // This is executed every tick
        EnergyMonitor.run();
        switch (state) {
            case GameState.Start:
                let room = _.values<Room>(Game.rooms)[0];
                let strategy = new StartStrategy(room);
                strategy.execute();
                break;
        }
    }
}