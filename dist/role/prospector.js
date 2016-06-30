let utility = require('utility');
let roleProspector = {
    /** @param {Creep} creep **/
    run: function (creep) {
        //If harvester has not been assigned a source, PANIC!!!!
        if (creep.memory.source == null) {
            console.log('Creep ' + creep.name + ' is a prospector with no available sources');
            return;
        }
        let source = Game.getObjectById(creep.memory.source);
        let master = Game.getObjectById(creep.memory.helper);
        if (creep.memory.helper && master == null) {
            creep.suicide();
        }
        if (creep.pos.isNearTo(source)) {
            if (creep.carry[RESOURCE_ENERGY] < 10) {
                creep.harvest(source);
            } else {
                let containers
                if (creep.memory.helper) {
                    let master = Game.getObjectById(creep.memory.helper)

                    containers = master.pos.lookFor(LOOK_CONSTRUCTION_SITES);
                } else {
                    containers = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
                }
                if (containers.length) {
                    creep.build(containers[0]);
                } else {
                    if (creep.memory.master == null && creep.pos.createConstructionSite(STRUCTURE_CONTAINER) == ERR_INVALID_TARGET) {
                        creep.suicide();
                    }
                }
            }
        } else {
            creep.moveTo(source);
        }
    },
    createRole: function (room, source, helper) {
        var spawns = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
        if (!spawns.length) {
            return;
        }
        var spawn = spawns[0];
        var name = spawn.createCreep([WORK, WORK, CARRY, MOVE], undefined, { role: 'prospector', source: source.id, helper: helper ? helper.id : null });
        if (_.isString(name))
            console.log('created new prospector ' + name);
    }
};

module.exports = roleProspector;