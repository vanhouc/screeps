var roleDrone = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (Game.getObjectById(creep.memory.source) == null)
            delete creep.memory.source;
        //If harvester has not been assigned a source, PANIC!!!!
        if (creep.memory.source == null) {
            delete creep.memory.tpt;
            return;
        }
        if (creep.memory.tpt == null) {
            var spawn = Game.rooms[creep.memory.home].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } })[0];
            creep.memory.tpt = creep.getCarryPerTick(Game.getObjectById(creep.memory.source));
        }
        if (!creep.memory.filling && creep.carry.energy == 0) {
            creep.memory.filling = true;
            creep.memory.upgrading = false;
            creep.memory.building = false;
        }
        if (creep.memory.filling && creep.carry.energy == creep.carryCapacity) {
            creep.memory.filling = false;
        }
        if (Game.getObjectById(creep.memory.source) && Game.getObjectById(creep.memory.source).memory.role == 'miner' && !Game.getObjectById(creep.memory.source).memory.drones.some(drone => drone == creep.id)) {
            Game.getObjectById(creep.memory.source).memory.drones.push(creep.id);
        }
        if (creep.memory.filling) {
            creep.moveTo(Game.getObjectById(creep.memory.source));
        } else {
            if (creep.memory.building || creep.memory.upgrading || this.harvest(creep) == ERR_NOT_FOUND) {
                if (creep.room.controller.level < 2 || this.build(creep) == ERR_NOT_FOUND) {
                    creep.memory.building = false;
                    this.upgrade(creep);
                }
            }
        }
    },
    build: function (creep) {
        if (creep.room.name === creep.memory.home) {
            let target = creep.findClosest(FIND_CONSTRUCTION_SITES);
            if (target) {
                let buildResult = creep.build(target);
                if (buildResult == ERR_NOT_IN_RANGE) {
                    return creep.moveTo(target);
                } else
                    return buildResult;
            } else {
                creep.memory.building = false;
                return ERR_NOT_FOUND;
            }
        } else {
            let route = Game.map.findRoute(creep.room, creep.memory.home);
            if (route.length > 0) {
                let exit = creep.pos.findClosestByRange(route[0].exit);
                return creep.moveTo(exit);
            }
        }
    },
    harvest: function (creep) {
        if (creep.room.name === creep.memory.home) {

            let target = creep.findClosest(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER ||
                        structure.structureType == STRUCTURE_CONTAINER) &&
                        (structure.energy < structure.energyCapacity ||
                            _.sum(structure.store) < structure.storeCapacity);
                }
            }, 1);

            if (target) {
                let transferResult = creep.transfer(target, RESOURCE_ENERGY)
                if (transferResult == ERR_NOT_IN_RANGE) {
                    return creep.moveTo(target);
                } else
                    return transferResult;
            } else {
                return ERR_NOT_FOUND
            }

        } else {
            let route = Game.map.findRoute(creep.room, creep.memory.home);
            if (route.length > 0) {
                let exit = creep.pos.findClosestByRange(route[0].exit);
                return creep.moveTo(exit);
            }
        }
    },
    upgrade: function (creep) {
        if (creep.room.name === creep.memory.home) {
            var upgradeResult = creep.upgradeController(creep.room.controller)
            if (upgradeResult === ERR_NOT_IN_RANGE) {
                return creep.moveTo(creep.room.controller);
            } else
                return upgradeResult;
        } else {
            var route = Game.map.findRoute(creep.room, creep.memory.home);
            if (route.length > 0) {
                var exit = creep.pos.findClosestByRange(route[0].exit);
                return creep.moveTo(exit);
            }
        }
    },
    createRole: function (room, source, cost) {
        var spawns = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
        if (!spawns.length) {
            console.log('Room ' + room.name + ' has no spawns');
            return;
        }
        var spawn = spawns[0];
        var body = [];
        switch (cost || room.energyAvailable) {
            case 550:
                body = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                break;
            case 300:
                body = [WORK, CARRY, CARRY, MOVE, MOVE];
                break;
        }
        var name = spawn.createCreep(body, undefined, { role: 'drone', home: room.name, source: source.id, filling: true });
        if (_.isString(name))
            console.log('created new drone ' + name);
    }
};

module.exports = roleDrone;