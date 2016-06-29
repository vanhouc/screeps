let md5 = require('md5');
var foreman = {
    run: function () {
        if (Memory.foreman == null) {
            Memory.foreman == { jobs: {} }
        }
        let nonUnionJobs = _.filter(Game.constructionSites, site => Memory.foreman.jobs[site.id] == null);
        for (scab of nonUnionJobs) {
            this.createJob(scab);
        }
        let abandonedControllers = _.filter(Game.rooms, room => room.controller).map(room => room.controller).filter(controller => !_.any(Memory.foreman.jobs, job => job.site == controller.id));
        for (controller of abandonedControllers) {
            this.createJob(controller);
        }
        let underStaffedJob = _.min(Memory.foreman.jobs, job => job.builders.length ? job.builders.length : 0);
        if (underStaffedJob) {
            
        }
    },
    createJob: function (site) {
        let jobId = md5(site.id + Game.time);
        Memory.foreman.jobs[jobId] = {
            id: jobId,
            builders: [],
            orders: [],
            site: site.id
        }
    }
}