import { useState, useCallback, useEffect } from "react";
import type { GameState, Direction, BoardState, TileData } from "../types/game";

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

function addRandomTile(board: BoardState): BoardState {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return board;

  const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  const newBoard = board.map((r) => [...r]);
  newBoard[row][col] = value;
  return newBoard;
}

function boardToTiles(board: BoardState): TileData[] {
  const tiles: TileData[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const value = board[row][col];
      if (value !== null) {
        tiles.push({
          id: `${row}-${col}-${value}`,
          value,
          position: { row, col },
        });
      }
    }
  }
  return tiles;
}

function move(board: BoardState, direction: Direction): { board: BoardState; score: number; moved: boolean } {
  let newBoard = board.map((r) => [...r]);
  let score = 0;
  let moved = false;

  const rotateClockwise = (b: BoardState): BoardState => {
    const n = b.length;
    const rotated = createEmptyBoard();
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        rotated[j][n - 1 - i] = b[i][j];
      }
    }
    return rotated;
  };

  const rotateCounterClockwise = (b: BoardState): BoardState => {
    const n = b.length;
    const rotated = createEmptyBoard();
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        rotated[n - 1 - j][i] = b[i][j];
      }
    }
    return rotated;
  };

  // Rotate board to make all movements "left"
  let rotations = 0;
  if (direction === "up") {
    rotations = 1;
    newBoard = rotateCounterClockwise(newBoard);
  } else if (direction === "right") {
    rotations = 2;
    newBoard = rotateClockwise(rotateClockwise(newBoard));
  } else if (direction === "down") {
    rotations = 3;
    newBoard = rotateClockwise(newBoard);
  }

  // Slide and merge left
  for (let row = 0; row < 4; row++) {
    const line = newBoard[row].filter((cell) => cell !== null);
    const merged: (number | null)[] = [];

    for (let i = 0; i < line.length; i++) {
      if (i < line.length - 1 && line[i] === line[i + 1]) {
        const value = line[i]! * 2;
        merged.push(value);
        score += value;
        i++; // Skip next
      } else {
        merged.push(line[i]!);
      }
    }

    while (merged.length < 4) {
      merged.push(null);
    }

    if (JSON.stringify(merged) !== JSON.stringify(newBoard[row])) {
      moved = true;
    }
    newBoard[row] = merged;
  }

  // Rotate back
  if (direction === "up") {
    newBoard = rotateClockwise(newBoard);
  } else if (direction === "right") {
    newBoard = rotateClockwise(rotateClockwise(newBoard));
  } else if (direction === "down") {
    newBoard = rotateCounterClockwise(newBoard);
  }

  return { board: newBoard, score, moved };
}

function canMove(board: BoardState): boolean {
  // Check for empty cells
  if (getEmptyCells(board).length > 0) return true;

  // Check for possible merges
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
  const [gameState, setGameState] = useState<GameState>(() => {
    let board = createEmptyBoard();
    board = addRandomTile(board);
    board = addRandomTile(board);

    return {
      board,
      tiles: boardToTiles(board),
      score: 0,
      moves: 0,
      gameOver: false,
      won: false,
    };
  });

  const makeMove = useCallback((direction: Direction) => {
    setGameState((prev) => {
      if (prev.gameOver) return prev;

      const { board: newBoard, score: addedScore, moved } = move(prev.board, direction);

      if (!moved) return prev;

      const boardWithNewTile = addRandomTile(newBoard);
      const won = hasWon(boardWithNewTile);
      const gameOver = !canMove(boardWithNewTile);

      return {
        board: boardWithNewTile,
        tiles: boardToTiles(boardWithNewTile),
        score: prev.score + addedScore,
        moves: prev.moves + 1,
        gameOver,
        won: won || prev.won,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    let board = createEmptyBoard();
    board = addRandomTile(board);
    board = addRandomTile(board);

    setGameState({
      board,
      tiles: boardToTiles(board),
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