var roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep) {

		if (creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
		}
		if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
			creep.memory.building = true;
		}

		if (creep.memory.building) {
			var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
		}
		else {
			if (creep.harvest(Game.getObjectById(creep.memory.source)) == ERR_NOT_IN_RANGE) {
				creep.moveTo(Game.getObjectById(creep.memory.source));
			}
		}
	}
};

module.exports = roleBuilder;