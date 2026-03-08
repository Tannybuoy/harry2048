import { motion } from "motion/react";
import { X } from "lucide-react";

interface RulesModalProps {
  onClose: () => void;
}

export function RulesModal({ onClose }: RulesModalProps) {
  const tileProgression = [
    { value: 2, emoji: "🪄", name: "Wand", color: "#F5EFE6" },
    { value: 4, emoji: "📖", name: "Spellbook", color: "#EBE0D4" },
    { value: 8, emoji: "🦉", name: "Owl", color: "#F5C997" },
    { value: 16, emoji: "⚗️", name: "Potion", color: "#F5A962" },
    { value: 32, emoji: "🧹", name: "Broomstick", color: "#F58F4B" },
    { value: 64, emoji: "✨", name: "Patronus", color: "#E57C5F" },
    { value: 128, emoji: "🐉", name: "Dragon", color: "#D4668B" },
    { value: 256, emoji: "🏆", name: "Trophy", color: "#B857A3" },
    { value: 512, emoji: "💀", name: "Horcrux", color: "#9B4D9E" },
    { value: 1024, emoji: "🗡️", name: "Sword", color: "#7A3E8B" },
    { value: 2048, emoji: "⚡", name: "Elder Wand", color: "#F5C842" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F5EFE6] rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-4xl font-bold text-[#7A5A5A] mb-2">How to Play</h2>
            <p className="text-[#8B7A8B]">Master the magical merge!</p>
          </div>
          <button
            onClick={onClose}
            className="bg-[#8B7A8B] hover:bg-[#7A5A7A] text-white p-2 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Rules */}
        <div className="space-y-6">
          {/* Basic Rules */}
          <div className="bg-white/50 rounded-2xl p-5">
            <h3 className="text-xl font-bold text-[#7A5A5A] mb-3">🎮 Basic Rules</h3>
            <ul className="space-y-2 text-[#7A5A5A]">
              <li className="flex items-start gap-2">
                <span className="text-[#F4B860] font-bold">•</span>
                <span>Use <strong>arrow keys</strong> (↑ ↓ ← →) to slide all tiles in that direction</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F4B860] font-bold">•</span>
                <span>When two tiles with the <strong>same item</strong> touch, they <strong>merge into one</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F4B860] font-bold">•</span>
                <span>Each merge creates the <strong>next item</strong> in the magical progression</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F4B860] font-bold">•</span>
                <span>After every move, a new tile (Wand or Spellbook) appears randomly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F4B860] font-bold">•</span>
                <span>Your goal is to create the <strong>Elder Wand (2048)</strong>! ⚡</span>
              </li>
            </ul>
          </div>

          {/* Tile Progression */}
          <div className="bg-white/50 rounded-2xl p-5">
            <h3 className="text-xl font-bold text-[#7A5A5A] mb-3">🪄 Tile Progression</h3>
            <p className="text-[#8B7A8B] mb-4 text-sm">
              Merge two of the same to create the next item:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tileProgression.map((tile) => (
                <div
                  key={tile.value}
                  style={{ backgroundColor: tile.color }}
                  className="rounded-xl p-3 flex flex-col items-center justify-center shadow-md"
                >
                  <div className="text-2xl mb-1">{tile.emoji}</div>
                  <div className="text-xs font-bold text-[#7A5A5A]">{tile.name}</div>
                  <div className="text-base text-[#8B7A8B] opacity-75">{tile.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Example */}
          <div className="bg-white/50 rounded-2xl p-5">
            <h3 className="text-xl font-bold text-[#7A5A5A] mb-3">✨ Example</h3>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="bg-[#F5EFE6] rounded-xl p-3 w-20 h-20 flex flex-col items-center justify-center shadow-md">
                <div className="text-2xl">🪄</div>
                <div className="text-xs font-bold">Wand</div>
              </div>
              <div className="text-2xl text-[#F4B860]">+</div>
              <div className="bg-[#F5EFE6] rounded-xl p-3 w-20 h-20 flex flex-col items-center justify-center shadow-md">
                <div className="text-2xl">🪄</div>
                <div className="text-xs font-bold">Wand</div>
              </div>
              <div className="text-2xl text-[#F4B860]">=</div>
              <div className="bg-[#EBE0D4] rounded-xl p-3 w-20 h-20 flex flex-col items-center justify-center shadow-md">
                <div className="text-2xl">📖</div>
                <div className="text-xs font-bold">Spellbook</div>
              </div>
            </div>
          </div>

          {/* Win & Lose Conditions */}
          <div className="bg-white/50 rounded-2xl p-5">
            <h3 className="text-xl font-bold text-[#7A5A5A] mb-3">🏆 Win & Lose</h3>
            <ul className="space-y-2 text-[#7A5A5A]">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Win:</strong> Create the Elder Wand (2048) tile!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>Lose:</strong> The board fills up and no more moves are possible</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-[#8B7A8B] hover:bg-[#7A5A7A] text-white py-4 rounded-2xl transition-all font-semibold"
        >
          Got it! Let's Play ✨
        </button>
      </motion.div>
    </motion.div>
  );
}