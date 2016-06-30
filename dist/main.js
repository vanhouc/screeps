let _ = require('lodash');
let md5 = require('md5');
let utility = require('utility');
let roleBuilder = require('builder');
let roleProspector = require('prospector');
let roleScout = require('scout');
let roleMiner = require('miner');
let roleDrone = require('drone');
let roleHauler = require('hauler');
let dispatcher = require('dispatcher');
let foreman = require('foreman');
let economyManager = require('economy');
Source.prototype.stats = function () {
    var miners = _.values(Game.creeps).filter(creep => creep.memory.role == 'miner' && creep.memory.source == this.id);
    console.log('Source: ' + this.id + ', Available Tiles: ' + this.pos.findPathableAround().length + ', Miners: ' + miners);
}
Creep.prototype.transferAll = function (target) {
    if (_.sum(this.carry) < 1) return ERR_NOT_ENOUGH_RESOURCES;
    for (resourceType in this.carry) {
        if (this.carry[resourceType] > 0)
            return this.transfer(target, resourceType);
    }
}
StructureContainer.prototype.reserveResources = function (id, resources) {
    let reserved = {};
    for (let resourceType in resources) {
        if (this.availableResources()[resourceType] < resources[resourceType]) {
            reserved[resourceType] = this.availableResources()[resourceType];
        } else {
            reserved[resourceType] = resources[resourceType];
        }
    }
    //Initialize memory space if undefined
    if (Memory.containers == null) {
        Memory.containers = {};
    }
    if (Memory.containers[this.id] == null) {
        Memory.containers[this.id] = { reserved: {} };
    }
    if (Memory.containers[this.id].reserved == null) {
        Memory.containers[this.id].reserved = {};
    }
    Memory.containers[this.id].reserved[id] = reserved;
    return reserved;
}
StructureContainer.prototype.canReserveResources = function (id, resources) {
    for (let resourceType in resources) {
        if (this.availableResources()[resourceType] < resources[resourceType]) {
            return ERR_NOT_ENOUGH_RESOURCES;
        }
    }
    //Initialize memory space if undefined
    if (Memory.containers[this.id] == null) {
        Memory.containers[this.id] = { reserved: {} };
    }
    return OK;
}
StructureContainer.prototype.availableResources = function () {
    //Initialize memory space if undefined
    //Initialize memory space if undefined
    if (Memory.containers == null) {
        Memory.containers = {};
    }
    if (Memory.containers[this.id] == null) {
        Memory.containers[this.id] = { reserved: {} };
    }
    let store = this.store;
    for (let reservation of _.values(Memory.containers[this.id].reserved)) {
        for (let resourceType in reservation) {
            if (store[resourceType] >= reservation[resourceType]) {
                store[resourceType] = store[resourceType] - reservation[resourceType];
            }
        }
    }
    return store;
}
StructureContainer.prototype.pickupReservation = function (id, target) {
    //Initialize memory space if undefined
    if (Memory.containers[this.id] == null) {
        Memory.containers[this.id] = { reserved: {} };
    }
    let reservation = Memory.containers[this.id].reserved[id]
    if (reservation == null) return ERR_INVALID_ARGS;
    for (let resourceType in reservation) {
        let transferResult = this.transfer(target, resourceType, reservation[resourceType]);
        if (transferResult == ERR_NOT_ENOUGH_RESOURCES) {
            console.log('oooooh shit someones been stealin from me');
        }
        if (transferResult == OK) {
            delete reservation[resourceType];
            if (!_.keys(reservation).length)
                delete Memory.containers[this.id].reserved[id];
            return transferResult;
        }

    }
    return ERR_NOT_ENOUGH_RESOURCES;
}
RoomPosition.prototype.findPathableAround = function () {
    var room = Game.rooms[this.roomName];
    var pathableTiles = [];
    var area = room.lookAtArea(this.y - 1, this.x - 1, this.y + 1, this.x + 1);
    for (var y in area) {
        for (var x in area[y]) {
            if (!_.some(area[y][x], (lookAt) =>
                (lookAt.type === "constructionSite" &&
                    lookAt.constructionSite.structureType != STRUCTURE_ROAD
                ) ||
                lookAt.type === "exit" ||
                lookAt.type === "source" ||
                (lookAt.type === "structure" &&
                    lookAt.structure.structureType != STRUCTURE_ROAD
                ) ||
                (lookAt.type === "terrain" &&
                    lookAt.terrain === "wall")
            )) {
                var checkPos = room.getPositionAt(x, y)
                pathableTiles.push(checkPos);
            }
        }
    }
    return pathableTiles;
}
Room.prototype.sourceStats = function () {
    var sources = this.find(FIND_SOURCES);
    for (source of sources) {
        source.stats();
    }
}
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
Creep.prototype.minerStats = function () {
    if (this.memory.role != 'miner') return null;
    var ePerTick = this.body.reduce((total, part) => part.type == WORK ? total + 2 : total, 0);
    var transports = this.memory.transports.map(drone => Game.getObjectById(drone)).filter(drone => drone != null);
    var transportPerTick = transports.length ? transports.reduce((total, drone) => total + drone.getCarryPerTick(this), 0) : 0;
    console.log('Miner: ' + this.name + ', Energy Per Tick: ' + ePerTick + ', Transports: ' + transports + ', Transported Per Tick: ' + transportPerTick);
}
Creep.prototype.transportStats = function () {
    var transports = _.filter(Game.creeps, creep => creep.memory.role === 'drone');
}
module.exports.loop = function () {
    if (Memory.containers == null) Memory.containers = {}
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    //RUN THE ECONOMY BIOTCH
    dispatcher.run();
    foreman.run();
    economyManager();
    for (let room of _.values(Game.rooms)) {
        let spawnsNeedingEnergy = room.find(FIND_MY_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_SPAWN && dispatcher.getActualResources(structure) < structure.energyCapacity });
        if (spawnsNeedingEnergy.length) {
            let spawn = spawnsNeedingEnergy[0];
            console.log('creating energy order for spawn ' + spawn.name);
            dispatcher.createOrder(spawn, { [RESOURCE_ENERGY]: spawn.energyCapacity - dispatcher.getActualResources(spawn) }, true);
        }
        let extensionsNeedingEnergy = room.find(FIND_MY_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_EXTENSION && dispatcher.getActualResources(structure) < structure.energyCapacity });
        if (extensionsNeedingEnergy.length) {
            let extension = extensionsNeedingEnergy[0];
            console.log('creating energy order for extension ' + extension.id);
            dispatcher.createOrder(extension, { [RESOURCE_ENERGY]: extension.energyCapacity - dispatcher.getActualResources(extension) }, true);
        }
        let overBilledSpawns = room.find(FIND_MY_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_SPAWN && dispatcher.getActualResources(structure) > structure.energyCapacity });
        for (let spawn of overBilledSpawns) {
            let spawnOrder = _.find(Memory.dispatcher.orders, order => order.recipient == spawn.id);
            if (spawnOrder.remainingResources[RESOURCE_ENERGY] > 0) spawnOrder.remainingResources[RESOURCE_ENERGY] -= dispatcher.getActualResources(spawn) - 300;
            else spawnOrder.transitResources[RESOURCE_ENERGY] -= dispatcher.getActualResources(spawn) - 300;
        }
    }
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.home == null) {
            creep.memory.home = Game.spawns.Spawn1.room.name;
        }
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if (creep.memory.role == 'scout') {
            roleScout.run(creep);
        }
        if (creep.memory.role == 'prospector') {
            roleProspector.run(creep);
        }
        if (creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
        if (creep.memory.role == 'drone') {
            roleDrone.run(creep);
        }
        if (creep.memory.role == 'hauler') {
            roleHauler.run(creep);
        }
    }
}