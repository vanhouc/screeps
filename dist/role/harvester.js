var roleHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.room.name === creep.memory.home) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
            });
            if (targets.length > 0) {
                var transferResult = creep.transfer(targets[0], RESOURCE_ENERGY)
                if (transferResult == ERR_NOT_IN_RANGE) {
                    return creep.moveTo(targets[0]);
                } else
                    return transferResult;
            } else {
                return ERR_NOT_FOUND
            }

        } else {
            var route = Game.map.findRoute(creep.room, creep.memory.home);
            if (route.length > 0) {
                console.log('Now heading to room ' + route[0].room);
                var exit = creep.pos.findClosestByRange(route[0].exit);
                return creep.moveTo(exit);
            }
        }
    }
};

module.exports = roleHarvester;