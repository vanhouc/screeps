var utility = require('utility');
var roleMiner = {
    /** @param {Creep} creep **/
    run: function (creep) {
        creep.memory.needTransports = false;
        //If harvester has not been assigned a source, PANIC!!!!
        if (creep.memory.source == null) {
            console.log('Creep ' + creep.name + ' is a miner with no available sources');
            return;
        }
        if (creep.memory.transports == null) {
            creep.memory.transports = [];
        }
        var transports = creep.memory.transports.map(transport => Game.getObjectById(transport)).filter(transport => transport != null);
        creep.memory.transports = transports.map(transport => transport.id);
        if (creep.carry.energy < creep.carryCapacity) {
            if (creep.harvest(Game.getObjectById(creep.memory.source)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.source));
            }
        }
        else {
            var transportsInRange = creep.pos.findInRange(transports.filter(transport => _.sum(transport.carry) < transport.carryCapacity), 1)
            if (transportsInRange.length) {
                creep.transfer(transportsInRange[0], RESOURCE_ENERGY);
            } else {
                var spawn = Game.rooms[creep.memory.home].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } })[0];
                var ePerTick = creep.body.filter(part => part.type == WORK).length * 3;
                var transportPerTick = transports.length ? transports.reduce((total, transport) => utility.getTransportPerTick(spawn, creep, transport.body), 0) : 0;
                if (ePerTick > transportPerTick) {
                    console.log('miner ' + creep.name + ' e per tick is ' + ePerTick + ' currently transporting ' + transportPerTick + ' per tick');
                    creep.memory.needTransports = true;
                }
            }
        }
    },
    createRole: function (room, source, cost) {
        console.log('creating creep');
        var spawns = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
        if (!spawns.length) {
            console.log('Room ' + room.name + ' has no spawns');
            return;
        }
        var spawn = spawns[0];
        var body = [];
        switch (cost || room.energyCapacityAvailable) {
            case 550:
                body = [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE];
                break;
            case 300:
                body = [WORK, WORK, CARRY, MOVE];
                break;
        }
        var name = spawn.createCreep(body, undefined, { role: 'miner', energyPerTick: body.filter(part => part.type == WORK).length * 3, source: source.id });
        if (_.isString(name))
            console.log('created new miner ' + name);
    }
};

module.exports = roleMiner;