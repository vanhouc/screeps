var utility = {
    findPathableAround: function(pos) {
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
}
}
module.exports = utility;