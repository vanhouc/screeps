var roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.constructionSite == null) return;
        let constructionSite = Game.getObjectById(creep.memory.constructionSite);
        if (constructionSite == null) {
            delete creep.memory.constructionSite;
            return;
        }
        if (creep.pos.inRangeTo(constructionSite, 3)) {
            creep.build(constructionSite);
        } else {
            creep.moveTo(constructionSite);
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
        var spawns = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
        if (!spawns.length) {
            console.log('Room ' + room.name + ' has no spawns');
            return;
        }
        var spawn = spawns[0];
        var body = [];
        switch (cost || room.energyAvailable) {
            case 550:
                body = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE];
                break;
            case 300:
                body = [WORK, WORK, CARRY, MOVE];
                break;
        }
        var name = spawn.createCreep(body, undefined, { role: 'builder', home: room.name, filling: true });
        if (_.isString(name))
            console.log('created new builder ' + name);
    }
};

module.exports = roleBuilder;