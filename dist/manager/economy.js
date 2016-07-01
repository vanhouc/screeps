module.exports = function () {
    var _ = require('lodash');
    var roleProspector = require('prospector');
    var roleDrone = require('drone');
    var roleHauler = require('hauler');
    var roleBuilder = require('builder');
    let roleMiner = require('miner');

    var ownedRooms = _.filter(Game.rooms, (room) => room.controller && room.controller.my);
    var mineableRooms = _.filter(Game.rooms, (room) => (room.controller == null || room.controller.my || room.controller.owner == null));
    var sources = _.flatten(mineableRooms.map(room => room.find(FIND_SOURCES)));
    var drones = _.filter(Game.creeps, creep => creep.memory.role == 'drone');
    var containers = _.flatten(ownedRooms.map(room => room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } })));
    var containerSources = sources.map(source => { return { source: source, container: containers.find(container => source.pos.isNearTo(container)) } }).filter(tuple => tuple.container);
<<<<<<< HEAD
    var availableSources = sources.filter(source => !_.any(Game.creeps, creep => creep.memory.source == source.id) && !_.any(containerSources, containerSource => containerSource.source.id == source.id));
    let prospectorNeedingHelp = _.filter(Game.creeps, creep => creep.memory.role == 'prospector').find(prospector => !_.any(Game.creeps, helper => helper.memory.helper || helper.memory.helper == prospector.id));
    if (prospectorNeedingHelp) {
        console.log('IM A PROSPECTOR AND I AM IN TROUBLE')
        return roleProspector.createRole(ownedRooms[0], Game.getObjectById(prospectorNeedingHelp.memory.source), prospectorNeedingHelp);
    }
    console.log(availableSources.length);
    //If no containers setup, make prospectors
    if (availableSources.length) {
        return roleProspector.createRole(ownedRooms[0], availableSources[0]);
    }
=======
    var availableSources = sources.filter(source => !_.any(Game.creeps, creep => creep.memory.source == source.id) || !_.any(containerSources, containerSource => containerSource.source.id == source.id));
>>>>>>> origin/javascript
    if (containerSources.length) {
        let miners = _.filter(Game.creeps, creep => creep.memory.role == 'miner');
        let haulers = _.filter(Game.creeps, creep => creep.memory.role == 'hauler');
        let builders = _.filter(Game.creeps, creep => creep.memory.role == 'builder');
        let availableContainerSource = _.find(containerSources, source => !miners.some(miner => miner.memory.source == source.source.id));
        //Bootstrap economy
        if (miners.length < 1) return roleMiner.createRole(ownedRooms[0], availableContainerSource.source.id, availableContainerSource.container.id, 300)
        if (haulers.length < 1) return roleHauler.createRole(ownedRooms[0], 300);
        //Regular economy
        if (availableContainerSource) {
            return roleMiner.createRole(ownedRooms[0], availableContainerSource.source.id, availableContainerSource.container.id, ownedRooms[0].energyCapacityAvailable)
        }
        if (haulers.length < _.filter(Game.structures, structure => structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION).length) {
            return roleHauler.createRole(ownedRooms[0], ownedRooms[0].energyCapacityAvailable);
        }
        if (builders.length < 3) {
            return roleBuilder.createRole(ownedRooms[0], ownedRooms[0].energyCapacityAvailable);
        }
    }
    //If there are unassisted prospectors spawn an assistant


}