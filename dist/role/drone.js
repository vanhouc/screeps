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