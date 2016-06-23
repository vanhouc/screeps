var roleHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        //If harvester has not been assigned a source, PANIC!!!!
        if (creep.memory.source == null) {
            console.log('Creep ' + creep.name + ' is a harvester with no available sources');
            return;
        }
        if (creep.carry.energy < creep.carryCapacity) {
            if (creep.harvest(Game.getObjectById(creep.memory.source)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.source));
            }
        }
        else {
            if (creep.room.name === creep.memory.home) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
                });
                if (targets.length > 0) {
                    if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }
            } else {
                var route = Game.map.findRoute(creep.room, creep.memory.home);
                if (route.length > 0) {
                    console.log('Now heading to room ' + route[0].room);
                    var exit = creep.pos.findClosestByRange(route[0].exit);
                    creep.moveTo(exit);
                }
            }
        }
    }
};

module.exports = roleHarvester;