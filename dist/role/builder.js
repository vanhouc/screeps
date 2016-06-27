var roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.room.name === creep.memory.home) {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                var buildResult = creep.build(targets[0]);
                if (buildResult == ERR_NOT_IN_RANGE) {
                    return creep.moveTo(targets[0]);
                } else
                    return buildResult;
            } else {
                return ERR_NOT_FOUND;
            }
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
        switch (cost || room.energyCapacityAvailable) {
            case 550:
                body = [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
                break;
            case 300:
                body = [WORK, CARRY, CARRY, MOVE];
                break;
        }
        var name = spawn.createCreep(body, undefined, { role: 'builder', home: room.name, source: source.id, filling: true });
        if (_.isString(name))
            console.log('created new builder ' + name);
    }
};

module.exports = roleBuilder;