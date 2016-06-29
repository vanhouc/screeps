var roleScout = {

    /** @param {Creep} creep **/
    run: function (creep) {
        //If harvester has not been assigned a source, PANIC!!!!
        if (creep.memory.destination == null) {
            console.log('Creep ' + creep.name + ' is a scout with no destination');
            return;
        }
        if (creep.room.name !== creep.memory.destination) {
            var route = Game.map.findRoute(creep.room, creep.memory.destination);
            if (route.length > 0) {
                console.log('Now heading to room ' + route[0].room);
                var exit = creep.pos.findClosestByRange(route[0].exit);
                creep.moveTo(exit);
            }
        } else {
            if (creep.room.controller)
                creep.moveTo(creep.room.controller);
            else
                creep.moveTo(25,25);
        }
    }
};

module.exports = roleScout;