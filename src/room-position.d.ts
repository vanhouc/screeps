    interface RoomPosition {
        isWalkable(): boolean;
        findPathToClosest(goal: RoomObject | RoomObject[]): { path: RoomPosition[], ops: number, target: RoomObject };
    }