var utility = require('utility');
var roleHarvester = require('harvester');
var roleBuilder = require('builder');
var roleUpgrader = require('upgrader')
var roleTransport = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (Game.getObjectById(creep.memory.source) == null)
            delete creep.memory.source;
        //If harvester has not been assigned a source, PANIC!!!!
        if (creep.memory.source == null) {
            delete creep.memory.tpt;
            console.log('Creep ' + creep.name + ' is a transport with no available sources');
            return;
        }
        if (creep.memory.tpt == null) {
            var spawn = Game.rooms[creep.memory.home].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } })[0];
            console.log(spawn);
            creep.memory.tpt = creep.getCarryPerTick(Game.getObjectById(creep.memory.source));
        }
        if (!creep.memory.filling && creep.carry.energy == 0) {
            creep.memory.filling = true;
            creep.memory.upgrading = false;
            creep.memory.building = false;
        }
        if (creep.memory.filling && creep.carry.energy == creep.carryCapacity) {
            creep.memory.filling = false;
        }
        if (Game.getObjectById(creep.memory.source) && Game.getObjectById(creep.memory.source).memory.role == 'miner' && !Game.getObjectById(creep.memory.source).memory.transports.some(transport => transport == creep.id)) {
            Game.getObjectById(creep.memory.source).memory.transports.push(creep.id);
        }
        if (creep.memory.filling) {
            creep.moveTo(Game.getObjectById(creep.memory.source));
        } else {
            if (creep.memory.building || creep.memory.upgrading || roleHarvester.run(creep) == ERR_NOT_FOUND) {
                if (creep.memory.upgrading || roleBuilder.run(creep) == ERR_NOT_FOUND) {
                    // roleUpgrader.run(creep);
                    creep.memory.upgrading = false;
                    creep.memory.building = false;
                } else {
                    creep.memory.building = true;
                }
            }
        }
    },
    createRole: function (room, source, cost) {
        var spawns = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
        if (!spawns.length) {
            console.log('Room ' + room.name + ' has no spawns');
            return;
        }
        var spawn = spawns[0];
        var body = [];
        switch (cost || room.energyAvailable) {
            case 550:
                body = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                break;
            case 300:
                body = [WORK, CARRY, CARRY, MOVE, MOVE];
                break;
        }
        var name = spawn.createCreep(body, undefined, { role: 'transport', home: room.name, source: source.id, filling: true });
        if (_.isString(name))
            console.log('created new transport ' + name);
    }
};

module.exports = roleTransport;