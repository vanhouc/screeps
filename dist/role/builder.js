let roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.room.name === creep.memory.home) {
            let target = creep.findClosest(FIND_CONSTRUCTION_SITES);
            console.log(creep.name + ' wants to build ' + target);
            if (target) {
                let buildResult = creep.build(target);
                if (buildResult == ERR_NOT_IN_RANGE) {
                    return creep.moveTo(target);
                } else
                    return buildResult;
            } else {
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
    createRole: function (room, source, cost) {
        let spawns = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
        if (!spawns.length) {
            console.log('Room ' + room.name + ' has no spawns');
            return;
        }
        let spawn = spawns[0];
        let body = [];
        switch (cost || room.energyCapacityAvailable) {
            case 550:
                body = [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
                break;
            case 300:
                body = [WORK, CARRY, CARRY, MOVE];
                break;
        }
        let name = spawn.createCreep(body, undefined, { role: 'builder', home: room.name, source: source.id, filling: true });
        if (_.isString(name))
            console.log('created new builder ' + name);
    }
};

module.exports = roleBuilder;