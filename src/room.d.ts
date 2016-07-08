interface Room {
    _memory(): RoomMemory;
    /**
     * Gets a cost matrix that includes buildings and construction sites
     */
    getCostMatrix(): CostMatrix;
}
interface RoomMemory {}