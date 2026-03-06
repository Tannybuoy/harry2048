import { useState, useCallback, useEffect, useRef } from "react";
import type { GameState, Direction, BoardState, TileData } from "../types/game";

let nextTileId = 1;

function createEmptyBoard(): BoardState {
  return Array.from({ length: 4 }, () => Array(4).fill(null));
}

function getEmptyCells(board: BoardState): { row: number; col: number }[] {
  const empty: { row: number; col: number }[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col] === null) {
        empty.push({ row, col });
      }
    }
  }
  return empty;
}

function buildBoard(tiles: TileData[]): BoardState {
  const board = createEmptyBoard();
  for (const tile of tiles) {
    if (!tile.isConsumed) {
      board[tile.position.row][tile.position.col] = tile.value;
    }
  }
  return board;
}

function createTile(row: number, col: number, value: number, isNew: boolean): TileData {
  return {
    id: nextTileId++,
    value,
    position: { row, col },
    isNew,
    isMerged: false,
  };
}

function addRandomTile(tiles: TileData[]): TileData[] {
  const board = buildBoard(tiles);
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return tiles;

  const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  return [...tiles, createTile(row, col, value, true)];
}

// Rotate a position clockwise: (r,c) → (c, 3-r)
function rotateCW(p: { row: number; col: number }): { row: number; col: number } {
  return { row: p.col, col: 3 - p.row };
}

// Rotate a position counter-clockwise: (r,c) → (3-c, r)
function rotateCCW(p: { row: number; col: number }): { row: number; col: number } {
  return { row: 3 - p.col, col: p.row };
}

function applyRotation(
  pos: { row: number; col: number },
  fn: (p: { row: number; col: number }) => { row: number; col: number },
  times: number,
): { row: number; col: number } {
  let p = pos;
  for (let i = 0; i < times; i++) {
    p = fn(p);
  }
  return p;
}

function moveTiles(
  currentTiles: TileData[],
  direction: Direction,
): { tiles: TileData[]; score: number; moved: boolean } {
  // Clone tiles, clear animation flags
  let tiles: TileData[] = currentTiles.map((t) => ({
    ...t,
    position: { ...t.position },
    isNew: false,
    isMerged: false,
  }));

  // Pre-rotate positions to normalize all directions to "slide left"
  // Matching the original board rotation logic:
  //   up:    rotateCCW(board) → slide left → rotateCW(board)
  //   right: rotate180        → slide left → rotate180
  //   down:  rotateCW(board)  → slide left → rotateCCW(board)
  if (direction === "up") {
    tiles.forEach((t) => (t.position = rotateCCW(t.position)));
  } else if (direction === "right") {
    tiles.forEach((t) => (t.position = applyRotation(t.position, rotateCW, 2)));
  } else if (direction === "down") {
    tiles.forEach((t) => (t.position = rotateCW(t.position)));
  }

  let score = 0;
  let moved = false;
  for (let row = 0; row < 4; row++) {
    const rowTiles = tiles
      .filter((t) => t.position.row === row)
      .sort((a, b) => a.position.col - b.position.col);

    let writeCol = 0;
    for (let i = 0; i < rowTiles.length; i++) {
      if (i < rowTiles.length - 1 && rowTiles[i].value === rowTiles[i + 1].value) {
        // Merge: keep first tile, mark second as consumed
        const keeper = rowTiles[i];
        const consumed = rowTiles[i + 1];

        keeper.mergedValue = keeper.value * 2;
        keeper.isMerged = true;
        score += keeper.mergedValue;

        if (keeper.position.col !== writeCol) moved = true;
        keeper.position.col = writeCol;

        // Move consumed tile to same position so it animates sliding in
        consumed.position.col = writeCol;
        consumed.isConsumed = true;

        moved = true;
        writeCol++;
        i++; // skip consumed tile
      } else {
        if (rowTiles[i].position.col !== writeCol) moved = true;
        rowTiles[i].position.col = writeCol;
        writeCol++;
      }
    }
  }

  // Reverse rotation to restore original orientation
  if (direction === "up") {
    tiles.forEach((t) => (t.position = rotateCW(t.position)));
  } else if (direction === "right") {
    tiles.forEach((t) => (t.position = applyRotation(t.position, rotateCW, 2)));
  } else if (direction === "down") {
    tiles.forEach((t) => (t.position = rotateCCW(t.position)));
  }

  return { tiles, score, moved };
}

function canMove(board: BoardState): boolean {
  if (getEmptyCells(board).length > 0) return true;

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const current = board[row][col];
      if (col < 3 && current === board[row][col + 1]) return true;
      if (row < 3 && current === board[row + 1][col]) return true;
    }
  }
  return false;
}

function hasWon(board: BoardState): boolean {
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col] === 2048) return true;
    }
  }
  return false;
}

export function useGame() {
  const isAnimating = useRef(false);
  const [gameState, setGameState] = useState<GameState>(() => {
    let tiles: TileData[] = [];
    const board = createEmptyBoard();

    // Add two initial tiles
    const emptyCells = getEmptyCells(board);
    const first = emptyCells.splice(Math.floor(Math.random() * emptyCells.length), 1)[0];
    const second = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    tiles.push(createTile(first.row, first.col, Math.random() < 0.9 ? 2 : 4, true));
    tiles.push(createTile(second.row, second.col, Math.random() < 0.9 ? 2 : 4, true));

    return {
      board: buildBoard(tiles),
      tiles,
      score: 0,
      moves: 0,
      gameOver: false,
      won: false,
    };
  });

  const makeMove = useCallback((direction: Direction) => {
    if (isAnimating.current) return;

    setGameState((prev) => {
      if (prev.gameOver) return prev;

      const { tiles: movedTiles, score: addedScore, moved } = moveTiles(prev.tiles, direction);

      if (!moved) return prev;

      const hasConsumed = movedTiles.some((t) => t.isConsumed);

      if (hasConsumed) {
        // Two-phase merge: first slide all tiles, then resolve merges
        isAnimating.current = true;

        const phase1Tiles = movedTiles.map((t) => ({
          ...t,
          isMerged: false,
        }));

        // Schedule phase 2
        setTimeout(() => {
          setGameState((phase1) => {
            const activeTiles = phase1.tiles
              .filter((t) => !t.isConsumed)
              .map((t) => ({ ...t }));

            // Apply merged values
            activeTiles.forEach((t) => {
              if (t.mergedValue) {
                t.value = t.mergedValue;
                t.mergedValue = undefined;
                t.isMerged = true;
              }
            });

            const tilesWithNew = addRandomTile(activeTiles);
            const board = buildBoard(tilesWithNew);
            const won = hasWon(board);
            const gameOver = !canMove(board);

            isAnimating.current = false;

            return {
              board,
              tiles: tilesWithNew,
              score: phase1.score,
              moves: phase1.moves,
              gameOver,
              won: won || phase1.won,
            };
          });
        }, 100);

        return {
          board: prev.board,
          tiles: phase1Tiles,
          score: prev.score + addedScore,
          moves: prev.moves + 1,
          gameOver: false,
          won: prev.won,
        };
      }

      // No merges — just slide and add new tile immediately
      const tilesWithNew = addRandomTile(movedTiles);
      const board = buildBoard(tilesWithNew);
      const won = hasWon(board);
      const gameOver = !canMove(board);

      return {
        board,
        tiles: tilesWithNew,
        score: prev.score + addedScore,
        moves: prev.moves + 1,
        gameOver,
        won: won || prev.won,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    isAnimating.current = false;
    let tiles: TileData[] = [];
    const board = createEmptyBoard();
    const emptyCells = getEmptyCells(board);
    const first = emptyCells.splice(Math.floor(Math.random() * emptyCells.length), 1)[0];
    const second = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    tiles.push(createTile(first.row, first.col, Math.random() < 0.9 ? 2 : 4, true));
    tiles.push(createTile(second.row, second.col, Math.random() < 0.9 ? 2 : 4, true));

    setGameState({
      board: buildBoard(tiles),
      tiles,
      score: 0,
      moves: 0,
      gameOver: false,
      won: false,
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const directionMap: Record<string, Direction> = {
          ArrowUp: "up",
          ArrowDown: "down",
          ArrowLeft: "left",
          ArrowRight: "right",
        };
        makeMove(directionMap[e.key]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [makeMove]);

  return { gameState, makeMove, resetGame };
}
