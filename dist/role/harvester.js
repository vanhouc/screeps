let roleHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.room.name === creep.memory.home) {

            let target = creep.findClosest(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER ||
                        structure.structureType == STRUCTURE_CONTAINER) && structure.energy < structure.energyCapacity;
                }
            }, 1);

            if (target) {
                let transferResult = creep.transfer(target, RESOURCE_ENERGY)
                if (transferResult == ERR_NOT_IN_RANGE) {
                    return creep.moveTo(target);
                } else
                    return transferResult;
            } else {
                return ERR_NOT_FOUND
            }

        } else {
            let route = Game.map.findRoute(creep.room, creep.memory.home);
            if (route.length > 0) {
                let exit = creep.pos.findClosestByRange(route[0].exit);
                return creep.moveTo(exit);
            }
        }
    }
};

module.exports = roleHarvester;