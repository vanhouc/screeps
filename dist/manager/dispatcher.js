let md5 = require('md5');
var dispatcher = {
    //Run this each tick before using dispatcher
    run: function () {
        if (Memory.dispatcher == null)
            Memory.dispatcher = {
                orders: {}
            }
        let finishedOrders = _.filter(Memory.dispatcher.orders, order => _.sum(this.addResources(order.remainingResources, order.transitResources)) < 1)
        for (let order of finishedOrders) {
            console.log('removing completed order ' + order.id)
            delete Memory.dispatcher.orders[order.id];
        }
        let missingDeliveryOrders = _.filter(Memory.dispatcher.orders, order => !_.any(Game.creeps, creep => creep.memory.role == 'hauler' && creep.memory.order == order.id) && _.sum(order.transitResources) > 0);
        for (let order of missingDeliveryOrders) {
            console.log('re-requesting resources for order missing delivery ' + order.id);
            order.remainingResources = this.addResources(order.remainingResources, order.transitResources);
            order.transitResources = this.subtractResources(order.transitResources, order.transitResources);
        }
        let brokenOrders = _.filter(Memory.dispatcher.orders, order => Game.getObjectById(order.recipient) == null || Game.getObjectById(order.recipient).energy >= Game.getObjectById(order.recipient).energyCapacity)
        for (let order of brokenOrders) {
            console.log('removing broken order ' + order.id)
            delete Memory.dispatcher.orders[order.id];
        }
        let understaffedOrders = _.filter(Memory.dispatcher.orders, order => _.sum(order.remainingResources) > 0);
        let priorityOrder = _.min(understaffedOrders, order => order.priority ? -100000 : _.sum(order.transitResources));
        if (priorityOrder && priorityOrder != Infinity && priorityOrder != -Infinity) {
            let ownedRooms = _.filter(Game.rooms, (room) => room.controller && room.controller.my);
            let containers = _.flatten(ownedRooms.map(room => room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } })));
            let availableContainers = containers.filter(container => _.sum(dispatcher.subtractResources(priorityOrder.remainingResources, container.availableResources(), true)) < 1);
            //If no containers have the resources to complete the job find a container that has any of the jobs needed resources
            if (!availableContainers.length) {
                console.log('looking for any container')
                availableContainers = containers.filter(container => _.sum(priorityOrder.remainingResources) >_.sum(dispatcher.subtractResources(priorityOrder.remainingResources, container.availableResources(), true, true)));
            }
            if (availableContainers.length) {
                let container = Game.getObjectById(priorityOrder.recipient).pos.findClosestByPath(availableContainers);
                if (container == null) return;
                console.log(_.sum(container.availableResources()))
                let hauler = this.findClosestAvailableHauler(container.pos);
                if (hauler) {
                    console.log('assigning ' + hauler.name + ' to order ' + priorityOrder.id);
                    hauler.memory.order = Memory.dispatcher.orders[priorityOrder.id].id;
                    if (_.sum(this.subtractResources(priorityOrder.remainingResources, hauler.carry)) < 1) {
                        priorityOrder.remainingResources = this.subtractResources(priorityOrder.remainingResources, hauler.carry);
                        priorityOrder.transitResources = this.addResources(priorityOrder.transitResources, hauler.carry);
                    } else {
                        let pickupResources = this.getCarryable(this.subtractResources(priorityOrder.remainingResources, hauler.carry, true, true), hauler.carryCapacity - _.sum(hauler.carry));
                        let actualResources = container.reserveResources(hauler.id, pickupResources);
                        priorityOrder.remainingResources = this.subtractResources(priorityOrder.remainingResources, actualResources);
                        priorityOrder.transitResources = this.addResources(priorityOrder.transitResources, actualResources);
                        hauler.memory.pickupPos = container.id;
                    }
                }
            }
        }
    },
    createOrder: function (recipient, resources, important) {
        let orderId = md5(recipient.id + Game.time);
        Memory.dispatcher.orders[orderId] = {
            id: orderId,
            remainingResources: resources,
            transitResources: { [RESOURCE_ENERGY]: 0 },
            deliveredResources: { [RESOURCE_ENERGY]: 0 },
            haulers: [],
            recipient: recipient.id,
            createdOn: Game.time,
            priority: important
        };
        return orderId;
    },
    findClosestAvailableHauler: function (pos) {
        return pos.findClosestByPath(FIND_MY_CREEPS, { filter: creep => creep.memory.role == 'hauler' && creep.memory.order == null });
    },
    getActualResources: function (recipient) {
        let orders = _.filter(Memory.dispatcher.orders, order => order.recipient == recipient.id);
        if (recipient.energyCapacity) {
            if (orders.length) {
                let actual = orders.reduce((total, order) => total + order.remainingResources[RESOURCE_ENERGY] + order.transitResources[RESOURCE_ENERGY], recipient.energy);
                return actual;
            } else {
                return recipient.energy;
            }
        }
        if (recipient.carry) {
            return orders.reduce((total, order) => dispatcher.addResources(total, dispatcher.addResources(order.remainingResources, order.transitResources)), recipient.carry);
        }
        if (recipient.storage) {
            return orders.reduce((total, order) => dispatcher.addResources(total, dispatcher.addResources(order.remainingResources, order.transitResources)), recipient.storage);
        }
    },
    addResources: function (first, second) {
        let result = {}
        for (resourceType in second) {
            result[resourceType] = first[resourceType] + second[resourceType];
        }
        return result;
    },
    subtractResources: function (first, second, allowNegatives, onlyPresentTypes) {
        let result = {}
        for (resourceType in second) {
            if (!onlyPresentTypes || first[resourceType] != null)
                result[resourceType] = first[resourceType] - second[resourceType];
            if (allowNegatives && result[resourceType] < 0) result[resourceType] = 0
        }
        return result;
    },
    getCarryable: function (resources, capacity) {
        let result = {}
        for (resourceType in resources) {
            if (capacity < 1) return result;
            result[resourceType] = resources[resourceType] > capacity ? capacity : resources[resourceType];
            capacity -= result[resourceType];
        }
        return result;
    }
}
module.exports = dispatcher;