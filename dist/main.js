var _ = require('lodash');
var utility = require('utility');
var roleHarvester = require('harvester');
var roleUpgrader = require('upgrader');
var roleBuilder = require('builder');
var roleScout = require('scout');

module.exports.loop = function () {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    console.log('Upgraders: ' + upgraders.length);

    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    console.log('Builders: ' + builders.length);

    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    //Check to see if there are available harvest spots on any sources
    var sources = _.flatten(_.values(Game.rooms).map((room) => room.find(FIND_SOURCES)));
    for (source of sources) {
        //Find available tiles next to the source
        var tilesAround = utility.findPathableAround(source.pos);
        //Find all creeps already assigned to the source
        var assignedCreeps = source.room.find(FIND_CREEPS, {
            filter: (creep) => creep != null && creep.memory != null && creep.memory.source === source.id
        });
        //If there are available spots spawn a harvester and assign it to the spot
        if (tilesAround.length > assignedCreeps.length) {
            var brokenCreep = _(Game.creeps).find(creep => (creep.memory.role == 'harvester' || creep.memory.role == 'builder' || creep.memory.role == 'upgrader') && creep.memory.source == null)
            if (brokenCreep) {
                brokenCreep.memory.source = source.id;
                console.log('Assigned ' + brokenCreep.name + ' to source ' + source.id);
            } else {
                var role;
                if (harvesters.length < upgraders.length) {
                    role = 'harvester';
                } else if (upgraders.length < builders.length) {
                    role = 'upgrader';
                } else {
                    role = 'builder';
                }
                var newName = Game.spawns.Spawn1.createCreep([WORK, CARRY, MOVE], undefined, { role: role, source: source.id });
                if (newName > 0)
                    console.log('Spawning new ' + role + ': ' + newName);
            }
        } else if (tilesAround.length < assignedCreeps.length) {
            assignedCreeps[0].memory.source = null;
            console.log('removed excess creep ' + assignedCreeps[0].name + ' from source ' + source.id);
        }
    }
    var ownedRooms = _.values(Game.rooms).filter(room => room.controller != null && room.controller.my === true);
    for (var room of ownedRooms) {
        console.log(room.name);
        var exits = Game.map.describeExits(room.name);
        for (var exit of _.values(exits)) {
            if (!_.any(Game.creeps, creep => creep.memory.role === 'scout' && creep.memory.destination === exit)) {
                console.log('Spawning scout to explore ' + exit);
                Game.spawns.Spawn1.createCreep([MOVE], undefined, { role: 'scout', destination: exit });
            }
        }

    }
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.home == null || creep.memory.home != 'E31S24') {
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
    }
}