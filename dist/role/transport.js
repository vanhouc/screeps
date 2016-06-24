var roleTransport = {

    /** @param {Creep} creep **/
    run: function (creep) {
        //If harvester has not been assigned a source, PANIC!!!!
        if (creep.memory.source == null) {
            console.log('Creep ' + creep.name + ' is a transport with no available sources');
            return;
        }
        if (!creep.memory.filling && creep.carry.energy == 0) {
            creep.memory.filling = true;
        }
        if (creep.memory.filling && creep.carry.energy == creep.carryCapacity) {
            creep.memory.filling = false;
        }
        if (Game.getObjectById(creep.memory.source) && Game.getObjectById(creep.memory.source).memory.role == 'miner') {
            Game.getObjectById(creep.memory.source).memory.transporter = creep.id;
        }
        if (creep.memory.filling) {
            creep.moveTo(Game.getObjectById(creep.memory.source));
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
    },
    createRole: function (room, source) {
        var spawns = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
        if (!spawns.length) {
            console.log('Room ' + room.name + ' has no spawns');
            return;
        }
        var spawn = spawns[0];
        var body = [];
        switch (room.energyCapacityAvailable) {
            case 550:
                body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
                break;
            case 300:
                body = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                break;
        }
        var name = spawn.createCreep(body, undefined, { role: 'transport', home: room.name, source: source.id, filling: true });
        if (_.isString(name))
            console.log('created new transport ' + name);
    }
};

module.exports = roleTransport;