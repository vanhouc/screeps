export interface Strategy {
    execute(): void;
    recommend(): number;
}