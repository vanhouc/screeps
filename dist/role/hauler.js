var roleHauler = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.order == null) {
            if (_.sum(creep.carry) > 0) {
                for (resourceType in creep.carry) {
                    if (creep.carry[resourceType] > 0) {
                        return creep.drop(resourceType);
                    }
                }
            }
            return;
        } 
        //If reservation is not null then the order has not been picked up yet
        if (creep.memory.reservation) {
            let container = Game.getObjectById(creep.memory.pickupPos);
            if (creep.pos.isNearTo(container)) {
                container.pickupReservation(creep.id, creep);
            } else {
                creep.moveTo(container);
            }
        } else {
            let order = creep.memory.order;
            let destination = Game.getObjectById(order.recipient);
            if (creep.pos.isNearTo(destination)) {
                this.deliverOrderResource(creep, order, destination);
            }
        }
    },
    deliverOrderResource: function (creep, order, destination) {
        if (_.sum(creep.carry) < 1) return ERR_NOT_ENOUGH_RESOURCES;
        for (resourceType in creep.carry) {
            if (creep.carry[resourceType] > 0) {
                destinationCapacity = _.sum(destination.carry || destination.storage);
                console.log('destination capacity:' + destinationCapacity)
                let transferAmount = creep.carry[resourceType] > destinationCapacity ? destinationCapacity : creep.carry[resourceType];
                let transferResult = creep.transfer(target, resourceType, transferAmount);
                if (transferResult == OK) {
                    order.transitResources[resourceType] -= transferAmount;
                } else {
                    console.log('error occurred while delivering order ' + creep.order.id + ' to ' + destination);
                }
            }
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
                body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
                break;
            case 300:
                body = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                break;
        }
        var name = spawn.createCreep(body, undefined, { role: 'hauler', home: room.name });
        if (_.isString(name))
            console.log('created new hauler ' + name);
    }
};

module.exports = roleHauler;