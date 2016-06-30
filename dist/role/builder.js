var roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.job == null) return;
        let job = Game.getObjectById(creep.memory.job);
        if (job == null) {
            delete creep.memory.job;
            return;
        }
        if (creep.pos.inRangeTo(job, 2)) {
            if (creep.build(job) == ERR_INVALID_TARGET) {
                if (job.structureType == STRUCTURE_CONTROLLER || creep.repair(job) == ERR_INVALID_TARGET) {
                    if (creep.upgradeController(job) == ERR_INVALID_TARGET) {
                        console.log('builder ' + creep.name + ' finished job ' + creep.memory.job);
                        delete creep.memory.job;
                    }
                }
            }
        } else {
            creep.moveTo(job);
        }
    },
    createRole: function (room, cost) {
        var spawns = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
        if (!spawns.length) {
            console.log('Room ' + room.name + ' has no spawns');
            return;
        }
        var spawn = spawns[0];
        var body = [];
        switch (cost > 550 ? 550 : cost) {
            case 550:
                body = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE];
                break;
            case 300:
                body = [WORK, WORK, CARRY, MOVE];
                break;
        }
        var name = spawn.createCreep(body, undefined, { role: 'builder' });
        if (_.isString(name))
            console.log('created new builder ' + name);
    }
};

module.exports = roleBuilder;