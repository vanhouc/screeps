module.exports = function () {
    var _ = require('lodash');
    var roleMiner = require('miner');
    var roleDrone = require('drone');
    var roleBuilder = require('builder');

    var ownedRooms = _.filter(Game.rooms, (room) => room.controller && room.controller.my);
    var mineableRooms = _.filter(Game.rooms, (room) => (room.controller == null || room.controller.my || room.controller.owner == null) && room.name !== 'E31S25' && room.name !== 'E31S23' && room.name !== 'E32S25');
    var sources = _.flatten(mineableRooms.map(room => room.find(FIND_SOURCES)));
    var miners = _.filter(Game.creeps, creep => creep.memory.role === 'miner');
    var availableMiners = miners.filter(miner => miner.memory.needTransports);
    var noTransports = availableMiners.filter(miner => !miner.memory.drones.length);
    var drones = _.filter(Game.creeps, creep => creep.memory.role === 'drone');
    var builders = _.filter(Game.creeps, creep => creep.memory.role === 'builder');
    var availableBuilders = builders.filter(builder => Game.getObjectById(builder.memory.source) == null);
    var containers = _.flatten(ownedRooms.map(room => room.find(FIND_MY_STRUCTURES), { filter: STRUCTURE_CONTAINER }));
    var containerSources = sources.map(source => { return { source: source, container: containers.find(container => source.pos.isNearTo(container)) } }).filter(tuple => tuple.container);
    for (miner of noTransports) {
        let availableTransport = drones.find(drone => Game.getObjectById(drone.memory.source) == null);
        if (availableTransport) {
            availableTransport.memory.source = miner.id;
        } else {
            return roleDrone.createRole(ownedRooms[0], miner);
        }

    }
    if (containerSources.length) {
        let stripMiners = _.filter(Game.creeps, creep => creep.memory.role == 'stripMiner');
        let availableContainerSource = _.find(containerSources, source => !stripMiners.some(miner => miner.memory.source == source.source.id))
        if (availableContainerSource) {
            stripMiners.createRole(ownedRooms[0], availableContainerSource.source, availableContainerSource.container)
        }
    } else {
        //okay so this one is a real giant turd
        //for all sources get miners
        //for each miner get the work value of the parts
        //if the sum of all miners for the source is less than 10
        //find the source with the least amount of miners that still has room for more miners
        var loneliestSource = _.min(sources.filter(source => miners
            .filter(miner => miner.memory.source == source.id)
            .reduce((total, miner) => total + (miner.body
                .reduce((total, part => part.type == WORK ? total + 2 : total), 0)), 0) < 10 &&
            source.pos.findPathableAround().length > miners.filter(miner => miner.memory.source == source.id).length), source => miners
                .filter(miner => miner.memory.source == source.id).length);
        if (loneliestSource && loneliestSource != Infinity) {
            return roleMiner.createRole(ownedRooms[0], loneliestSource);
        }
        let loneliestMiner = _.min(availableMiners, miner => miner.memory.drones.length);
        if (loneliestMiner) {
            let availableTransport = drones.find(drone => Game.getObjectById(drone.memory.source) == null);
            if (availableTransport) {
                availableTransport.memory.source = loneliestMiner.id;
            } else {
                return roleDrone.createRole(ownedRooms[0], loneliestMiner);
            }
        }
    }
}