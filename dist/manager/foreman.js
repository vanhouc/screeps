let dispatcher = require('dispatcher');
var foreman = {
    run: function () {
        let finishedJobs = _.filter(Game.creeps, creep => creep.memory.role == 'builder' && creep.memory.job && !Game.getObjectById(creep.memory.job))
        for (finished of finishedJobs) {
            console.log('job ' + finished.memory.job + ' is finished');
            delete finished.memory.job;
        }
        let availableBuilder = _.find(Game.creeps, creep => creep.memory.role == 'builder' && creep.memory.job == null);
        if (availableBuilder) {
            let abandonedControllers = _.filter(Game.rooms, room => room.controller).map(room => room.controller).filter(controller => !_.any(Game.creeps, creep => creep.memory.role == 'builder' && creep.memory.job == controller.id));
            for (controller of abandonedControllers) {
                availableBuilder = this.findClosestAvailableBuilder(controller.pos);
                availableBuilder.memory.job = controller.id;
                return;
            }
            let sites = _.filter(Game.constructionSites, site => !_.any(Game.creeps, creep => creep.memory.role == 'builder' && creep.memory.job == site.id));
            for (site of sites) {
                console.log('creating build job for ' + site.structureType + ' ' + site.id);
                availableBuilder = this.findClosestAvailableBuilder(site.pos);
                availableBuilder.memory.job = site.id;
                return;
            }
            let damagedBuildings = _.filter(Game.structures, structure => !_.any(Game.creeps, creep => creep.memory.role == 'builder' && creep.memory.job == structure.id) && structure.hits < structure.hitsMax);
            for (repair of damagedBuildings) {
                console.log('creating repair job for ' + repair.structureType + ' ' + repair.id);
                availableBuilder = this.findClosestAvailableBuilder(repair.pos);
                availableBuilder.memory.job = repair.id;
                return;
            }
        }
        let needsResources = _.filter(Game.creeps, creep => {
            if (creep.memory.role == 'builder') {
                if (Game.getObjectById(creep.memory.job) == null) return false;
                if (Game.getObjectById(creep.memory.job).structureType == STRUCTURE_CONTROLLER)
                    return creep.carry[RESOURCE_ENERGY] == 0;
                if (Game.getObjectById(creep.memory.job).hits && Game.getObjectById(creep.memory.job).structureType != STRUCTURE_WALL) {
                    return dispatcher.getActualResources(creep)[RESOURCE_ENERGY] < ((Game.getObjectById(creep.memory.job).hitsMax - Game.getObjectById(creep.memory.job).hits) / 100)
                } else {
                    return dispatcher.getActualResources(creep)[RESOURCE_ENERGY] < (Game.getObjectById(creep.memory.job).progressTotal - Game.getObjectById(creep.memory.job).progress)
                }
            }
        });
        for (let builder of needsResources) {
            if (Game.getObjectById(builder.memory.job).hits) {
                console.log('creating order for repair job ' + builder.name);
                dispatcher.createOrder(builder, { [RESOURCE_ENERGY]: builder.carryCapacity - _.sum(builder.carry) });
            } else if (Game.getObjectById(builder.memory.job).structureType == STRUCTURE_CONTROLLER) {
                console.log('creating order for upgrade job ' + builder.memory.job + ', Quantity: ' + builder.carryCapacity - _.sum(builder.carry));
                dispatcher.createOrder(builder, { [RESOURCE_ENERGY]: builder.carryCapacity - _.sum(builder.carry) });
            } else {
                console.log('creating order for build job ' + builder.memory.job + ', Quantity: ' + (Game.getObjectById(builder.memory.job).progressTotal - Game.getObjectById(builder.memory.job).progress));
                dispatcher.createOrder(builder, { [RESOURCE_ENERGY]: Game.getObjectById(builder.memory.job).progressTotal - Game.getObjectById(builder.memory.job).progress });
            }
        }
    },
    findClosestAvailableBuilder: function (pos) {
        return pos.findClosestByPath(FIND_MY_CREEPS, { filter: creep => creep.memory.role == 'builder' && creep.memory.job == null });
    },
    createJob: function (site) {
        Memory.foreman.jobs[site.id] = {
            id: site.id,
            site: site.id
        }
    }
}
module.exports = foreman;