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
    var builders = _.filter(Game.creeps, creep => creep.memory.role == 'builder');
    var availableBuilders = builders.filter(builder => Game.getObjectById(builder.memory.source) == null);
    var containers = _.flatten(ownedRooms.map(room => room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } })));
    var containerSources = sources.map(source => { return { source: source, container: containers.find(container => source.pos.isNearTo(container)) } }).filter(tuple => tuple.container);
    var availableSources = sources.filter(source => !_.any(Game.creeps, creep => creep.memory.source == source.id) && !_.any(containerSources, containerSource => containerSource.source.id == source.id));
    if (containerSources.length) {
        let miners = _.filter(Game.creeps, creep => creep.memory.role == 'miner');
        let availableContainerSource = _.find(containerSources, source => !miners.some(miner => miner.memory.source == source.source.id))
        if (availableContainerSource) {
            return roleMiner.createRole(ownedRooms[0], availableContainerSource.source.id, availableContainerSource.container.id)
        }
        var haulers = _.filter(Game.creeps, creep => creep.memory.role == 'hauler');
        if (!haulers.length || haulers.length < 5) {
            return roleHauler.createRole(ownedRooms[0]);
        }
    }
    if (availableSources.length) {
        return roleProspector.createRole(ownedRooms[0], availableSources[0].id);
    }

}