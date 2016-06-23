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
			if (creep.room.name === creep.memory.home) {
				var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
				if (targets.length) {
					if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
						creep.moveTo(targets[0]);
					}
				}
			} else {
				var route = Game.map.findRoute(creep.room, creep.memory.home);
				if (route.length > 0) {
					console.log('Now heading to room ' + route[0].room);
					var exit = creep.pos.findClosestByRange(route[0].exit);
					creep.moveTo(exit);
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