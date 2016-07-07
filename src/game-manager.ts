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
    export var state: GameState = GameState.Early;

    export function globalBootstrap() {
        // Set up your global objects.
        // This method is executed only when Screeps system instantiated new "global".

        // Use this bootstrap wisely. You can cache some of your stuff to save CPU
        // You should extend prototypes before game loop in here.
        console.log("This method is only run when new global is created by Screeps cycle");
        sampleVariable = "This is how you can use variables in GameManager";
        Room.prototype._memory = Room.prototype.memory;
        Creep.prototype._memory = Creep.prototype.memory;
        Room.prototype.getCostMatrix = function () {
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
            let matrix = new PathFinder.CostMatrix();
            for (let unwalkablePos of structurePos) {
                matrix.set(unwalkablePos.x, unwalkablePos.y, 255)
            }
            return matrix;
        }
    }

    export function loop() {
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