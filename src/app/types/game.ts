export type BoardState = (number | null)[][];

export interface TileData {
  id: number;
  value: number;
  position: { row: number; col: number };
  isNew?: boolean;
  isMerged?: boolean;
}

export interface GameState {
  board: BoardState;
  tiles: TileData[];
  score: number;
  moves: number;
  gameOver: boolean;
  won: boolean;
}

export type Direction = "up" | "down" | "left" | "right";
