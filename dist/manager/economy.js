module.exports = function () {
    var _ = require('lodash');
    var roleMiner = require('miner');
    var roleTransport = require('transport');

    var ownedRooms = _.filter(Game.rooms, (room) => room.controller && room.controller.my);
    var mineableRooms = _.filter(Game.rooms, (room) => (room.controller == null || room.controller.my || room.controller.owner == null) && room.name !== 'E31S25' && room.name !== 'E31S23' && room.name !== 'E32S25');
    //console.log('Mineable Rooms: ' + mineableRooms.length);
    var sources = _.flatten(mineableRooms.map(room => room.find(FIND_SOURCES)));
    //console.log("Total Sources: " + sources.length);
    var miners = _.filter(Game.creeps, creep => creep.memory.role === 'miner');
    //console.log('Total Miners: ' + miners.length);
    var availableMiners = miners.filter(miner => miner.memory.needTransports);
    var noTransports = availableMiners.filter(miner => !miner.memory.transports.length);
    var transports = _.filter(Game.creeps, creep => creep.memory.role === 'transport');
    //console.log('Total Transports: ' + transports.length);
    var availableTransports = transports.filter(transport => Game.getObjectById(transport.memory.source) == null);
    //console.log('Available Transports: ' + availableTransports.length);
    var builders = _.filter(Game.creeps, creep => creep.memory.role === 'builder');
    //console.log('Total Builders: ' + builders.length);
    var availableBuilders = builders.filter(builder => Game.getObjectById(builder.memory.source) == null);
    //console.log('Available Builders: ' + availableBuilders.length);
    for (miner of noTransports) {
        if (availableTransports.length) {
            availableTransports[0].memory.source = miner.id;
        }
        console.log('miner ' + miner.name + ' has no transports');
        roleTransport.createRole(ownedRooms[0], miner);
    }
    var availableSources = sources.filter(source => !miners.length || miners.filter(miner => miner.memory.source == source.id).reduce((total, miner) => total + (miner.body.filter(part => part.type == WORK).length * 3), 0) < 18);
    console.log('Available Sources: ' + availableSources.length);
    for (source of availableSources) {
        //If no miners build a cheap one, since there is not enough for a large
        roleMiner.createRole(ownedRooms[0], source);
    }
    for (miner of availableMiners) {
        if (availableTransports.length) {
            availableTransports[0].memory.source = miner.id;
        }
        console.log('miner ' + miner.name + ' needs another transport');
        roleTransport.createRole(ownedRooms[0], miner);
    }
}