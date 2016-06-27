var utility = {
    findPathableAround: function (pos) {
		var room = Game.rooms[pos.roomName];
		var pathableTiles = [];
		var area = room.lookAtArea(pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1);
		for (var y in area) {
			for (var x in area[y]) {
				if (!_.some(area[y][x], (lookAt) =>
					(lookAt.type === "constructionSite" &&
						lookAt.constructionSite.structureType != STRUCTURE_ROAD
					) ||
					lookAt.type === "exit" ||
					lookAt.type === "source" ||
					(lookAt.type === "structure" &&
						lookAt.structure.structureType != STRUCTURE_ROAD
					) ||
					(lookAt.type === "terrain" &&
						lookAt.terrain === "wall")
				)) {
					var checkPos = room.getPositionAt(x, y)
					pathableTiles.push(checkPos);
				}
			}
		}
		return pathableTiles;
	},
	    getTransportPerTick: function (origin, goal, body) {
        var ticksPerTile = Math.ceil(body.reduce((total, part) => part.type == MOVE ? total - 1 : total + 1, 0));
        ticksPerTile = ticksPerTile < 1 ? 1 : ticksPerTile;
        var route = PathFinder.search(origin.pos, {pos: goal.pos, range: 1});
        var totalDropoffTicks = ticksPerTile * (route.path.length * 2);
        var carryPerTrip = body.reduce((total, part) => part.type == CARRY ? total + 50 : total + 0, 0);
        return carryPerTrip / totalDropoffTicks;
    }
}
module.exports = utility;