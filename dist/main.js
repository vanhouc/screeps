var _ = require('lodash');
var utility = require('utility');
var roleHarvester = require('harvester');
var roleUpgrader = require('upgrader');
var roleBuilder = require('builder');

module.exports.loop = function () {
    console.log(_.VERSION);
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

    //Check to see if there are available harvest spots on any sources
    var sources = _.flatten(_.values(Game.rooms).map((room) => room.find(FIND_SOURCES)));
    for (source of sources) {
        //Find available tiles next to the source
        console.log(source.id);
        console.log((source.pos.y - 1) +','+ (source.pos.x - 1)+','+ (source.pos.y + 1)+','+ (source.pos.x + 1));
        var tilesAround = utility.findPathableAround(source.pos);
        console.log('Available tiles: ' + tilesAround.length);
        //Find all creeps already assigned to the source
        console.log(source.room.find(FIND_MY_CREEPS).length)
        var assignedCreeps = _(source.room.find(FIND_MY_CREEPS))
        .filter((creep) => creep.memory.source == source.id);
        assignedCreeps = _.values(assignedCreeps);
        console.log('Assigned creeps: ' + assignedCreeps.length);
        //If there are available spots spawn a harvester and assign it to the spot
        if (tilesAround.length > assignedCreeps.length) {
            var brokenCreep = _(Game.creeps).find(creep => (creep.memory.role == "harvester" || creep.memory.role == 'builder' || creep.memory.role == 'upgrader') && creep.memory.source == null)
            if (brokenCreep) {
                brokenCreep.memory.source = source.id;
                console.log('Assigned ' + brokenCreep.name + ' to source ' + source.id);
            } else {
                var newName = Game.spawns.Spawn1.createCreep([WORK, CARRY, MOVE], undefined, { role: 'harvester', source: source.id });
                console.log('Spawning new harvester: ' + newName);
            }
        }
    }

    if (upgraders.length < 4) {
        var newName = Game.spawns.Spawn1.createCreep([WORK, CARRY, MOVE], undefined, { role: 'upgrader' });
        console.log('Spawning new upgrader: ' + newName);
    }

    if (builders.length < 1) {
        var newName = Game.spawns.Spawn1.createCreep([WORK, CARRY, MOVE], undefined, { role: 'builder' });
        console.log('Spawning new builder: ' + newName);
    }

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
    }
}