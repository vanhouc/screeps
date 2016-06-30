var roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.job == null) return;
        let job = Memory.foreman.jobs[creep.memory.job];
        if (job == null) {
            delete creep.memory.job;
            return;
        }
        let site = Game.getObjectById(job.site)
        if (creep.pos.inRangeTo(site, 2)) {
            if (creep.build(site) == ERR_INVALID_TARGET) {
                if(creep.repair(site) == ERR_INVALID_TARGET) {
                    creep.upgradeController(site);
                }
            }
        } else {
            creep.moveTo(site);
        }
    },
    createRole: function (room) {
        var spawns = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
        if (!spawns.length) {
            console.log('Room ' + room.name + ' has no spawns');
            return;
        }
        var spawn = spawns[0];
        var body = [];
        switch (room.energyAvailable) {
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