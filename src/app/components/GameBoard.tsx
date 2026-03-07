import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tile } from "./Tile";
import type { BoardState, TileData, Direction } from "../types/game";

interface GameBoardProps {
  board: BoardState;
  tiles: TileData[];
  onSwipe?: (direction: Direction) => void;
}

const DESKTOP_TILE_SIZE = 80;
const GAP = 12;

function useTileSize() {
  const [tileSize, setTileSize] = useState(DESKTOP_TILE_SIZE);

  useEffect(() => {
    function compute() {
      if (window.innerWidth < 768) {
        // On mobile: fit board within viewport width minus page padding (32px)
        // Board = padding(12*2) + 4*tile + 3*gap(12) = 60 + 4*tile
        const available = Math.min(window.innerWidth - 32, 400);
        const size = Math.floor((available - 60) / 4);
        setTileSize(Math.max(size, 40));
      } else {
        setTileSize(DESKTOP_TILE_SIZE);
      }
    }

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return tileSize;
}

export function GameBoard({ board, tiles, onSwipe }: GameBoardProps) {
  const tileSize = useTileSize();
  const tileStep = tileSize + GAP;

  // Touch swipe handling
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current || !onSwipe) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      const MIN_SWIPE = 30;

      if (Math.max(absDx, absDy) < MIN_SWIPE) {
        touchStart.current = null;
        return;
      }

      if (absDx > absDy) {
        onSwipe(dx > 0 ? "right" : "left");
      } else {
        onSwipe(dy > 0 ? "down" : "up");
      }

      touchStart.current = null;
    },
    [onSwipe],
  );

  return (
    <div
      className="relative bg-[#8B7A8B] p-3 rounded-2xl shadow-2xl w-fit aspect-square touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Grid Background */}
      <div className="grid grid-cols-4 gap-3 aspect-square">
        {Array.from({ length: 16 }).map((_, index) => (
          <div
            key={index}
            className="bg-[#6D5C6D] rounded-xl aspect-square"
            style={{ width: tileSize, height: tileSize }}
          />
        ))}
      </div>

      {/* Tiles Layer */}
      <div className="absolute inset-3">
        <AnimatePresence>
          {tiles.map((tile) => (
            <Tile key={tile.id} tile={tile} tileSize={tileSize} tileStep={tileStep} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
