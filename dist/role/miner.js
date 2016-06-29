let utility = require('utility');
let roleMiner = {
    /** @param {Creep} creep **/
    run: function (creep) {
        //strip miners that do not know how to harvest are useless, they must be dealt with
        if (creep.memory.source == null) {
            console.log(creep.name + ' HAS BROUGHT GREAT SHAME UPRON HIS FAMARY');
            creep.suicide();
            return;
        }
        if (!creep.pos.isEqualTo(Game.getObjectById(creep.memory.container))) {
            creep.moveTo(Game.getObjectById(creep.memory.container));
        } else
            creep.harvest(Game.getObjectById(creep.memory.source))
    },
    createRole: function (room, cost, source, container) {
        var spawns = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
        if (!spawns.length) {
            return;
        }
        var spawn = spawns[0];
        var body = [];
        switch (cost || room.energyAvailable) {
            case 550:
                body = [WORK, WORK, WORK, WORK, WORK, MOVE];
                break;
            case 300:
            default:
                body = [WORK, WORK, MOVE, MOVE];
                break;
        }
        var name = spawn.createCreep(body, undefined, { role: 'miner', source: source, container: container });
        if (_.isString(name))
            console.log('created new miner ' + name);
    }
};

module.exports = roleMiner;