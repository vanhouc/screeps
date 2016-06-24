var roleMiner = {

    /** @param {Creep} creep **/
    run: function (creep) {
        //If harvester has not been assigned a source, PANIC!!!!
        if (creep.memory.source == null) {
            console.log('Creep ' + creep.name + ' is a miner with no available sources');
            return;
        }
        if (creep.carry.energy < creep.carryCapacity) {
            if (creep.harvest(Game.getObjectById(creep.memory.source)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.source));
            }
        }
        else {
            if (creep.memory.transporter) {
                creep.transfer(Game.getObjectById(creep.memory.transporter), RESOURCE_ENERGY);
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
                body = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];
                break;
            case 300:
                body = [WORK, WORK, CARRY, MOVE];
                break;
        }
        var name = spawn.createCreep(body, undefined, { role: 'miner', source: source.id });
        if (_.isString(name))
            console.log('created new miner ' + name);
    }
};

module.exports = roleMiner;