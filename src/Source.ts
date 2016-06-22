/// <reference path="screeps.d.ts" />
interface Source {
	getMemory(): SourceMemory;
	getMiningNodes(): RoomPosition[];
}
Source.prototype.getMemory = function() {
	var _this:Source = this;
	return Memory.sources[_this.id];
}
Source.prototype.getMiningNodes = function() {
	var _this: Source = this;
	var nodes = _this.getMemory().nodes;
	if (_this.getMemory().nodes == undefined) {
		_this
	}
	return _this.pos.findPathableAround();
}
interface Memory {
	sources: {[id: string]: SourceMemory}
}
interface SourceMemory {
	nodes: MiningNode[];
	forbidden: boolean;
}
interface MiningNode {
	sourceId: string;
	creepName: string;
	position: string;
}