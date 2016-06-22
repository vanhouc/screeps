/// <reference path="RoomManager.ts" />

class SourceManager {
	constructor() {
		if (Memory.sources === undefined) {
			Memory.sources = {};
		}
	}
	registerSource(id: string) {
		var source = Game.getObjectById<Source>(id);
		source.getHarvestSpots();
		Memory.sources[id] = { harvestRoutes: [], isPlotted: false, forbidden: false };
		
	}
	main() {
	}
	private updatePath(id: string): SourceRoute
	private updatePath(route: SourceRoute): SourceRoute
	private updatePath(target: any): SourceRoute {
		var p0 = performance.now();
		var route: SourceRoute
		if (_.isString(target)) {
			route = {
				sourceId: target,
				spawnName: null,
				creepName: null,
				needsUpdate: false,
				harvestPos: null,
			};
		}
		else route = target;
		var id = route.sourceId;
		var source = Game.getObjectById<Source>(id);
		var memory = Memory.sources[id];
		var room = source.room;
		var locations = source.pos.findPathableAround(true);
		var avoid = memory.harvestRoutes.map(avoidRoute => {
			return room.getPositionAt(
				avoidRoute.harvestPos.x,
				avoidRoute.harvestPos.y);
		});
		if (route.harvestPos) {
			avoid.splice(_.findIndex(avoid, avoidRoute => avoidRoute == route.harvestPos));
		}
		var spawn = source.pos.findClosest<Spawn>(FIND_MY_SPAWNS);
		var toSpawn = source.pos.findPathTo(spawn, { ignoreCreeps: true, avoid: avoid });
		if (!toSpawn || toSpawn.length == 0) {
			memory.isPlotted = true;
			return null;
		}
		toSpawn.pop();
		var atSpawn = room.getPositionAt(toSpawn[toSpawn.length - 1].x, toSpawn[toSpawn.length - 1].y);
		var atSource = room.getPositionAt(toSpawn[0].x, toSpawn[0].y)
		var toSource = atSpawn.findPathTo(atSource, { ignoreCreeps: true, avoid: avoid });
		route.spawnName = spawn.name;
		route.needsUpdate = false;
		route.harvestPos = { x: toSpawn[0].x, y: toSpawn[0].y };
		route.toSource = toSource;
		route.toSpawn = toSpawn;
		return route;
	}
}