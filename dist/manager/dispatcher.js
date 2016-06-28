let md5 = require('md5');
var dispatcher = {
    //Run this each tick before using dispatcher
    init: function() {
        if (Memory.dispatcher == null)
        Memory.dispatcher = {
            orders: {}
        }
    },
    run: function() {
        let understaffedOrders = _.filter(Memory.dispatcher.orders, order => _.sum(order.remainingResources) > 0);
        let priorityOrder = _.max(understaffedOrders, order => _.sum(order.remainingResources));
        if (priorityOrder && priorityOrder != Infinity) {
            
        }
    },
    createOrder: function(recipient, resources) {
        let orderId = md5(recipient + Game.time);
        Memory.dispatcher.orders.orderId ={
            id: orderId,
            remainingResources: resources,
            transitResources: {RESOURCE_ENERGY: 0},
            deliveredResources: {RESOURCE_ENERGY: 0},
            haulers: [],
            recipient: recipient.id,
            createdOn: Game.time
        };
        return orderId;
    },
    findClosestAvailableHauler: function(pos) {
        return pos.findClosest(FIND_MY_CREEPS, {filter: creep => creep.memory.role == 'hauler' && creep.memory.order == null});
    }
}