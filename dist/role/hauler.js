var roleHauler = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.order == null) {
            return;
        }
        if (Memory.dispatcher.orders[creep.memory.order] == null) {
            delete creep.memory.order;
            return;
        }
        //If reservation is not null then the order has not been picked up yet
        if (creep.memory.pickupPos) {
            let container = Game.getObjectById(creep.memory.pickupPos);
            if (creep.pos.isNearTo(container)) {
                container.pickupReservation(creep.id, creep);
                delete creep.memory.pickupPos
            } else {
                creep.moveTo(container);
            }
        } else {
            let order = Memory.dispatcher.orders[creep.memory.order];
            let destination = Game.getObjectById(order.recipient);
            if (creep.pos.isNearTo(destination)) {
                if(this.deliverOrderResource(creep, order, destination) == ERR_NOT_ENOUGH_RESOURCES) {
                    delete creep.memory.order;
                }
            } else {
                creep.moveTo(destination);
            }
        }
    },
    deliverOrderResource: function (creep, order, destination) {
        if (_.sum(creep.carry) < 1) return ERR_NOT_ENOUGH_RESOURCES;
        for (resourceType in creep.carry) {
            if (creep.carry[resourceType] > 0) {
                destinationCapacity = destination.energyCapacity ? destination.energyCapacity - destination.energy : destination.carry ? destination.carryCapacity - _.sum(destination.carry) : destination.storeCapacity - _.sum(destination.store)
                console.log('destination capacity:' + destinationCapacity)
                let transferAmount = creep.carry[resourceType] > destinationCapacity ? destinationCapacity : creep.carry[resourceType];
                let transferResult = creep.transfer(destination, resourceType, transferAmount);
                if (transferResult == OK) {
                    console.log(creep.name + ' delivered ' + transferAmount + ' ' + resourceType + ' for order ' + order.id)
                    order.transitResources[resourceType] -= transferAmount;
                } else {
                    console.log('error occurred while delivering order ' + order.id + ' to ' + destination);
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