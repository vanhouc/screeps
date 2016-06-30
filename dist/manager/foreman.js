let md5 = require('md5');
let dispatcher = require('dispatcher');
var foreman = {
    run: function () {
        if (Memory.foreman == null) {
            Memory.foreman = { jobs: {} }
        }
        let nonUnionJobs = _.filter(Game.constructionSites, site => Memory.foreman.jobs[site.id] == null);
        for (scab of nonUnionJobs) {
            console.log('creating build job for ' + scab.structureType + ' ' + scab.id);
            this.createJob(scab);
        }
        let damagedBuildings = _.filter(Game.structures, structure => Memory.foreman.jobs[structure.id] == null && structure.hits < structure.hitsMax);
        for (repair of damagedBuildings) {
            console.log('creating repair job for ' + repair.structureType + ' ' + repair.id);
            this.createJob(repair);
        }
        let abandonedControllers = _.filter(Game.rooms, room => room.controller).map(room => room.controller).filter(controller => !_.any(Memory.foreman.jobs, job => job.site == controller.id));
        for (controller of abandonedControllers) {
            this.createJob(controller);
        }
        let underStaffedJob = _.find(Memory.foreman.jobs, job => !_.any(Game.creeps, creep => creep.memory.role == 'builder' && creep.memory.job == job.id));
        if (underStaffedJob) {
            let availableBuilder = this.findClosestAvailableBuilder(Game.getObjectById(underStaffedJob.site).pos);
            if (availableBuilder) {
                availableBuilder.memory.job = underStaffedJob.id;
            }
        }
        let finishedJobs = _.filter(Memory.foreman.jobs, job => job.id == null || Game.getObjectById(job.id) == null || (Game.getObjectById(job.site).hits && Game.getObjectById(job.site).hits == Game.getObjectById(job.site).hitsMax));
        for (let job in finishedJobs) {
            console.log('deleting finished job ' + job.id || job.site);
            delete Memory.foreman.jobs[job.id];
        }
        let needsResources = _.filter(Memory.foreman.jobs, job => {
            let builder = _.find(Game.creeps, creep => creep.memory.role == 'builder' && creep.memory.job == job.id);
            if (Game.getObjectById(job.id).hits) {
                return builder != null &&
                    (Game.getObjectById(job.site).hitsMax - Game.getObjectById(job.site).hits) / 100 > dispatcher.getActualResources(builder)[RESOURCE_ENERGY]
            } else
                return builder != null &&
                    (Game.getObjectById(job.site).progressTotal - Game.getObjectById(job.site).progress) > dispatcher.getActualResources(builder)[RESOURCE_ENERGY];
        });
        for (let job of needsResources) {
            let builder = _.find(Game.creeps, creep => creep.memory.role == 'builder' && creep.memory.job == job.id);
            if (Game.getObjectById(job.site).hits)
                dispatcher.createOrder(builder, { [RESOURCE_ENERGY]: (Game.getObjectById(job.site).hitsMax - Game.getObjectById(job.site).hits) / 100 });
            else
                dispatcher.createOrder(builder, { [RESOURCE_ENERGY]: Game.getObjectById(job.site).progressTotal - Game.getObjectById(job.site).progress });
        }
    },
    findClosestAvailableBuilder: function (pos) {
        return _.find(Game.creeps, creep => creep.memory.role == 'builder' && creep.memory.job == null);
    },
    createJob: function (site) {
        Memory.foreman.jobs[site.id] = {
            id: site.id,
            orders: [],
            site: site.id
        }
    }
}
module.exports = foreman;