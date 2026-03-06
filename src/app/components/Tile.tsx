import { motion } from "motion/react";
import type { TileData } from "../types/game";

interface TileProps {
  tile: TileData;
}

const tileConfig: Record<
  number,
  { bg: string; text: string; emoji: string; label: string }
> = {
  2: { bg: "#F5EFE6", text: "#7A6E7A", emoji: "🪄", label: "Wand" },
  4: { bg: "#EBE0D4", text: "#7A6E7A", emoji: "📖", label: "Spellbook" },
  8: { bg: "#F5C997", text: "#FFFFFF", emoji: "🦉", label: "Owl" },
  16: { bg: "#F5A962", text: "#FFFFFF", emoji: "🧪", label: "Potion" },
  32: { bg: "#F58F4B", text: "#FFFFFF", emoji: "🧹", label: "Broomstick" },
  64: { bg: "#E57C5F", text: "#FFFFFF", emoji: "🛡️", label: "House Crest" },
  128: { bg: "#D4668B", text: "#FFFFFF", emoji: "✨", label: "Patronus" },
  256: { bg: "#B857A3", text: "#FFFFFF", emoji: "🏆", label: "Trophy" },
  512: { bg: "#9B4D9E", text: "#FFFFFF", emoji: "👻", label: "Cloak" },
  1024: { bg: "#7A3E8B", text: "#FFFFFF", emoji: "💀", label: "Horcrux" },
  2048: { bg: "#F5C842", text: "#7A3E8B", emoji: "⚡", label: "Elder Wand" },
};

export function Tile({ tile }: TileProps) {
  const config = tileConfig[tile.value] || tileConfig[2];
  const { row, col } = tile.position;

  return (
    <motion.div
      initial={tile.isNew ? { opacity: 0, scale: 0, x: col * 92, y: row * 92 } : false}
      animate={{
        opacity: 1,
        scale: tile.isMerged ? [1.15, 1] : 1,
        x: col * 92,
        y: row * 92,
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        x: { type: "spring", stiffness: 400, damping: 30 },
        y: { type: "spring", stiffness: 400, damping: 30 },
        scale: tile.isNew
          ? { type: "spring", stiffness: 400, damping: 20, delay: 0.1 }
          : tile.isMerged
            ? { type: "spring", stiffness: 400, damping: 30 }
            : { duration: 0 },
        opacity: tile.isNew
          ? { duration: 0.1, delay: 0.1 }
          : { duration: 0 },
      }}
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
      className="absolute w-20 h-20 rounded-xl flex flex-col items-center justify-center shadow-lg"
    >
      <div className="text-2xl mb-0.5">{config.emoji}</div>
      <div className="text-xs font-semibold">{config.label}</div>
    </motion.div>
  );
}
