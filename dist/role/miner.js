let utility = require('utility');
let roleMiner = {
    /** @param {Creep} creep **/
    run: function (creep) {
        creep.memory.needTransports = false;
        //If harvester has not been assigned a source, PANIC!!!!
        if (creep.memory.source == null) {
            console.log('Creep ' + creep.name + ' is a miner with no available sources');
            return;
        }
        if (creep.memory.drones == null) {
            creep.memory.drones = [];
        }
        var drones = creep.memory.drones.map(drone => Game.getObjectById(drone)).filter(drone => drone != null);
        creep.memory.drones = drones.map(drone => drone.id);
        if (creep.carry.energy < creep.carryCapacity) {
            if (creep.harvest(Game.getObjectById(creep.memory.source)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.source));
            }
        }
        else {
            var transportsInRange = creep.pos.findInRange(drones.filter(drone => _.sum(drone.carry) < drone.carryCapacity), 1)
            if (transportsInRange.length) {
                creep.transfer(transportsInRange[0], RESOURCE_ENERGY);
            } else {
                var spawn = Game.rooms[creep.memory.home].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } })[0];
                var ePerTick = creep.body.reduce((total, part) => part.type == WORK ? total + 3 : total, 0);
                var transportPerTick = drones.length ? drones.reduce((total, drone) => total + drone.getCarryPerTick(creep), 0) : 0;
                if (ePerTick > transportPerTick) {
                    creep.memory.needTransports = true;
                }
            }
        }
    },
    createRole: function (room, source, cost) {
        var spawns = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
        if (!spawns.length) {
            return;
        }
        var spawn = spawns[0];
        var body = [];
        switch (cost || room.energyAvailable) {
            case 550:
                body = [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE];
                break;
            case 300:
            default:
                body = [WORK, WORK, CARRY, MOVE];
                break;
        }
        var name = spawn.createCreep(body, undefined, { role: 'miner', energyPerTick: body.reduce((total, part) => part.type == WORK ? total + 3 : total, 0), source: source.id });
        if (_.isString(name))
            console.log('created new miner ' + name);
    }
};

module.exports = roleMiner;