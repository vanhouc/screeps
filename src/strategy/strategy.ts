import {GameState} from "./../game-state"
export interface Strategy {
    state: GameState;
    execute(): void;
    recommend(): number;
}