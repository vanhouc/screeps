let md5 = require('md5');
var dispatcher = {
    //Run this each tick before using dispatcher
    run: function () {
        if (Memory.dispatcher == null)
            Memory.dispatcher = {
                orders: {}
            }
        let finishedOrders = _.filter(Memory.dispatcher.orders, order => _.sum(order.remainingResources) + _.sum(order.transitResources) < 1)
        for (order of finishedOrders) {
            delete Memory.dispatcher.orders[order.id];
        }
        let understaffedOrders = _.filter(Memory.dispatcher.orders, order => _.sum(order.remainingResources) > 0);
        let priorityOrder = _.max(understaffedOrders, order => _.sum(order.remainingResources));
        if (priorityOrder && priorityOrder != Infinity) {
            let ownedRooms = _.filter(Game.rooms, (room) => room.controller && room.controller.my);
            let containers = _.flatten(ownedRooms.map(room => room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } })));
            let containerWithResources = _.find(containers, container => _.sum(priorityOrder.requiredResources) < _.sum(dispatcher.subtractResources(priorityOrder.requiredResources, dispatcher.getActualResources(container), true)) == OK);
            if (containerWithResources) {
                let hauler = this.findClosestAvailableHauler(containerWithResources.pos);
                if (hauler) {
                    hauler.memory.order = Memory.dispatcher.orders[priorityOrder.id];
                    hauler.memory.pickupPos = containerWithResources.id;
                    containerWithResources.reserveResources(hauler.id, this.orderTransitHaulQty(hauler, order, containerWithResources));
                    hauler.memory.reservation = Memory.containers[containerWithResources.id].reserved[hauler.id];
                }
            }
        }
    },
    createOrder: function (recipient, resources) {
        let orderId = md5(recipient.id + Game.time);
        Memory.dispatcher.orders[orderId] = {
            id: orderId,
            remainingResources: resources,
            transitResources: { RESOURCE_ENERGY: 0 },
            deliveredResources: { RESOURCE_ENERGY: 0 },
            haulers: [],
            recipient: recipient.id,
            createdOn: Game.time
        };
        return orderId;
    },
    orderTransitHaulQty: function (hauler, order, storage) {
        let availableCapacity = hauler.carryCapacity;
        let haulerResources = {}
        for (let resourceType in resources) {
            let fullAmount = storage.availableResources()[resourceType] < order.remainingResources[resourceType] ? storage.availableResources()[resourceType] : order.remainingResources[resourceType]
            if (fullAmount > hauler.carryCapacity) {
                haulerResources[resourceType] = hauler.carryCapacity;
                order.remainingResources[resourceType] -= hauler.carryCapacity;
                order.transitResources[resourceType] += hauler.carryCapacity;
                return haulerResources;
            } else {
                haulerResources[resourceType] = fullAmount;
                order.remainingResources[resourceType] -= fullAmount;
                order.transitResources[resourceType] += fullAmount;
            }
        }
        return haulerResources;
    },
    findClosestAvailableHauler: function (pos) {
        return pos.findClosest(FIND_MY_CREEPS, { filter: creep => creep.memory.role == 'hauler' && creep.memory.order == null });
    },
    getActualResources: function (recipient) {
        let orders = _.filter(Memory.dispatcher.orders, order => order.recipient == recipient.id);
        if (recipient.energyCapacity) {
            let actual = orders.reduce((total, order) => total + order.remainingResources.RESOURCE_ENERGY + order.transitResources.RESOURCE_ENERGY, recipient.energy);
            return actual;
        }
        if (recipient.carry) {
            return orders.reduce((total, order) => dispatcher.addResources(total, dispatcher.addResources(order.remainingResources, order.transitResources)), recipient.carry);
        }
    },
    addResources: function (first, second) {
        for (resourceType in second) {
            first[resourceType] += second[resourceType];
        }
        return first;
    },
    subtractResources: function (first, other, allowNegatives) {
        for (resourceType in second) {
            first[resourceType] -= second[resourceType];
            if (allowNegatives && first[resourceType] < 0) first[resourceType] = 0
        }
        return first;
    },
    getCarryable: function (first, other, allowNegatives) {
        for (resourceType in second) {
            first[resourceType] -= second[resourceType];
            if (allowNegatives && first[resourceType] < 0) first[resourceType] = 0
        }
        return first;
    }
}
module.exports = dispatcher;