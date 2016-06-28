module.exports = function () {
    var _ = require('lodash');
    var roleMiner = require('miner');
    var roleTransport = require('transport');

    var ownedRooms = _.filter(Game.rooms, (room) => room.controller && room.controller.my);
    var mineableRooms = _.filter(Game.rooms, (room) => (room.controller == null || room.controller.my || room.controller.owner == null) && room.name !== 'E31S25' && room.name !== 'E31S23' && room.name !== 'E32S25');
    var sources = _.flatten(mineableRooms.map(room => room.find(FIND_SOURCES)));
    var miners = _.filter(Game.creeps, creep => creep.memory.role === 'miner');
    var availableMiners = miners.filter(miner => miner.memory.needTransports);
    var noTransports = availableMiners.filter(miner => !miner.memory.transports.length);
    var transports = _.filter(Game.creeps, creep => creep.memory.role === 'transport');
    var availableTransports = transports.filter(transport => Game.getObjectById(transport.memory.source) == null);
    var builders = _.filter(Game.creeps, creep => creep.memory.role === 'builder');
    var availableBuilders = builders.filter(builder => Game.getObjectById(builder.memory.source) == null);
    for (miner of noTransports) {
        if (availableTransports.length) {
            availableTransports[0].memory.source = miner.id;
        } else {
            return roleTransport.createRole(ownedRooms[0], miner);
        }

    }
    var loneliestSource = _.min(sources.filter(source => !miners.length || miners
        .filter(miner => miner.memory.source == source.id)
        .reduce((total, miner) => total + (miner.body
            .reduce((total, part => part.type == WORK ? total + 3 : total), 0)), 0) < 18), source => miners.filter(miner => miner.memory.source == source.id).length);
    if (loneliestSource) {
        //If no miners build a cheap one, since there is not enough for a large
        return roleMiner.createRole(ownedRooms[0], loneliestSource);
    }
    let loneliestMiner = _.min(availableMiners, miner => miner.memory.transports.length);
    if (loneliestMiner) {
        if (availableTransports.length) {
            availableTransports[0].memory.source = loneliestMiner.id;
        } else {
            return roleTransport.createRole(ownedRooms[0], loneliestMiner);
        }
    }

}