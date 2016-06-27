var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.room.name === creep.memory.home) {
            var upgradeResult = creep.upgradeController(creep.room.controller)
            if (upgradeResult === ERR_NOT_IN_RANGE) {
                return creep.moveTo(creep.room.controller);
            } else
            return upgradeResult;
        } else {
            var route = Game.map.findRoute(creep.room, creep.memory.home);
            if (route.length > 0) {
                var exit = creep.pos.findClosestByRange(route[0].exit);
                return creep.moveTo(exit);
            }
        }
    }
};

module.exports = roleUpgrader;