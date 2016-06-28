let _ = require('lodash');
let utility = require('utility');
let roleHarvester = require('harvester');
let roleUpgrader = require('upgrader');
let roleBuilder = require('builder');
let roleScout = require('scout');
let roleMiner = require('miner');
let roleTransport = require('transport');
let economyManager = require('economy');

RoomObject.prototype.findClosest = function (type, findOpts, range, pathOpts) {
    let goals = this.room.find(type, findOpts).map(obj => { return { id: obj.id, pos: obj.pos, range: 0 } });
    let path = PathFinder.search(this.pos, goals, pathOpts).path;
    if (!path.length) return null;
    let goal = goals.find(goal => goal.pos.isNearTo(path[path.length - 1]));
    if (!goal) return null;
    return Game.getObjectById(goal.id);
}
Creep.prototype.getCarryPerTick = function (dest) {
    let spawn = this.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } })[0];
    let route = PathFinder.search(spawn.pos, dest.pos).path
        .map(pos => {
            let things = pos.look();
            if (things.find(x => x.type == 'structure' && x.structure == 'road')) return 1;
            if (things.find(x => x.type == 'terrain' && x.terrain == 'plain')) return 2;
            if (things.find(x => x.type == 'terrain' && x.terrain == 'swamp')) return 5;
            return 0;
        });
    let pickupWeight = Math.ceil(this.body.reduce((total, part) => part.type == MOVE ? total - 1 : part.type == CARRY ? total : total + 1, 0));
    // creep cannot move faster than 1 tile per tick
    pickupWeight = pickupWeight < 1 ? 1 : pickupWeight;
    let pickupTicks = route.reduce((total, tileCost) => total + tileCost * pickupWeight);
    let dropOffWeight = Math.ceil(this.body.reduce((total, part) => part.type == MOVE ? total - 1 : total + 1, 0));
    // creep cannot move faster than 1 tile per tick
    dropOffWeight = dropOffWeight < 1 ? 1 : dropOffWeight;
    let dropOffTicks = route.reduce((total, tileCost) => total + tileCost * dropOffWeight);
    // account for the ticks for transfer
    let totalTicks = pickupTicks + dropOffTicks + 2;
    let carryPerTrip = this.body.reduce((total, part) => part.type == CARRY ? total + 50 : total, 0);
    return carryPerTrip / (totalTicks / 2);
}

module.exports.loop = function () {
    for (let name in Memory.creeps) {
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