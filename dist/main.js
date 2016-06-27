var _ = require('lodash');
var utility = require('utility');
var roleHarvester = require('harvester');
var roleUpgrader = require('upgrader');
var roleBuilder = require('builder');
var roleScout = require('scout');
var roleMiner = require('miner');
var roleTransport = require('transport');
var economyManager = require('economy');

module.exports.loop = function () {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
    //RUN THE ECONOMY BIOTCH
    economyManager();
    //Check to see if there are available harvest spots on any sources
    var mineableRooms = _.filter(Game.rooms, (room) => room.controller == null || room.controller.my || room.controller.owner == null);
    var sources = _.flatten(mineableRooms.map(room => room.find(FIND_SOURCES)));
    var ownedRooms = _.values(Game.rooms).filter(room => room.controller != null && room.controller.my === true);
    // for (var room of ownedRooms) {
    //     console.log(room.name);
    //     var exits = Game.map.describeExits(room.name);
    //     for (var exit of _.values(exits)) {
    //         if (!_.any(Game.creeps, creep => creep.memory.role === 'scout' && creep.memory.destination === exit)) {
    //             console.log('Spawning scout to explore ' + exit);
    //             Game.spawns.Spawn1.createCreep([MOVE], undefined, { role: 'scout', destination: exit });
    //         }
    //     }
    // }
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.home == null) {
            console.log('setting home to ' + Game.spawns.Spawn1.room.name);
            creep.memory.home = Game.spawns.Spawn1.room.name;
        }
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role == 'scout') {
            roleScout.run(creep);
        }
        if (creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
        if (creep.memory.role == 'transport') {
            roleTransport.run(creep);
        }
    }
}