import { useState, useRef, useCallback } from "react";
import { GameBoard } from "./components/GameBoard";
import { GameOverModal } from "./components/GameOverModal";
import { RulesModal } from "./components/RulesModal";
import { useGame } from "./hooks/useGame";
import { Sparkles, RotateCcw, HelpCircle, Volume2, VolumeX } from "lucide-react";
import backgroundImage from "../../background.jpg";
import leviosaMusic from "../../leviosa.mp3";

export default function App() {
  const { gameState, makeMove, resetGame } = useGame();
  const [continueAfterWin, setContinueAfterWin] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(leviosaMusic);
      audioRef.current.loop = true;
    }
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsMusicPlaying(!isMusicPlaying);
  }, [isMusicPlaying]);

  const showModal = gameState.won && !continueAfterWin ? true : gameState.gameOver;

  return (
    <div className="min-h-screen bg-[#594761] flex items-center justify-center p-2 md:p-4 relative overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img
          src={backgroundImage}
          alt=""
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </div>

      {/* Decorative stars */}
      <div className="absolute top-12 left-12 text-[#E89AC7] opacity-70">
        <Sparkles className="w-8 h-8" />
      </div>
      <div className="absolute top-24 right-24 text-[#E89AC7] opacity-50">
        <Sparkles className="w-6 h-6" />
      </div>
      <div className="absolute bottom-20 left-32 text-[#E89AC7] opacity-60">
        <Sparkles className="w-10 h-10" />
      </div>
      <div className="absolute bottom-32 right-16 text-[#E89AC7] opacity-40">
        <Sparkles className="w-7 h-7" />
      </div>

      <div className="relative z-10 max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-2 md:mb-8">
          <h1 className="text-3xl md:text-6xl font-bold text-[#F4B860] mb-1 md:mb-2 drop-shadow-lg tracking-wide">LEVIOSA 2048</h1>
          <p className="text-[#E89AC7] text-sm md:text-lg">Merge tiles to reach the Elder Wand! ⚡</p>
        </div>

        {/* Score Panel + Game Board aligned container */}
        <div className="w-fit mx-auto">
          <div className="flex justify-between items-center mb-2 md:mb-6 gap-2 md:gap-4">
            <div className="flex-1 bg-[#8B7A8B] rounded-xl md:rounded-2xl p-2 md:p-4 text-center">
              <div className="text-[#E89AC7] text-xs md:text-sm uppercase tracking-wide mb-0.5 md:mb-1">Score</div>
              <div className="text-[#F4B860] text-xl md:text-3xl font-bold">{gameState.score}</div>
            </div>
            <div className="flex-1 bg-[#8B7A8B] rounded-xl md:rounded-2xl p-2 md:p-4 text-center">
              <div className="text-[#E89AC7] text-xs md:text-sm uppercase tracking-wide mb-0.5 md:mb-1">Moves</div>
              <div className="text-[#F4B860] text-xl md:text-3xl font-bold">{gameState.moves}</div>
            </div>
          </div>

          {/* Game Board */}
          <GameBoard board={gameState.board} tiles={gameState.tiles} onSwipe={makeMove} />
        </div>

        {/* Instructions */}
        <div className="mt-2 md:mt-6 text-center text-[#E89AC7] text-xs md:text-sm">
          <p className="hidden md:block">Use arrow keys to move tiles. Merge identical items to progress!</p>
          <p className="md:hidden">Swipe to move tiles. Merge identical items to progress!</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 md:gap-4 mt-2 md:mt-4">
          <button
            onClick={resetGame}
            className="bg-[#F4B860] hover:bg-[#F5C997] text-[#594761] p-3 md:p-4 rounded-xl md:rounded-2xl transition-all shadow-lg hover:shadow-xl"
            title="New Game"
          >
            <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={() => setShowRules(true)}
            className="bg-[#F4B860] hover:bg-[#F5C997] text-[#594761] p-3 md:p-4 rounded-xl md:rounded-2xl transition-all shadow-lg hover:shadow-xl"
            title="Rules"
          >
            <HelpCircle className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={toggleMusic}
            className="bg-[#F4B860] hover:bg-[#F5C997] text-[#594761] p-3 md:p-4 rounded-xl md:rounded-2xl transition-all shadow-lg hover:shadow-xl"
            title={isMusicPlaying ? "Mute Music" : "Play Music"}
          >
            {isMusicPlaying ? (
              <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <VolumeX className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Game Over Modal */}
      {showModal && (
        <GameOverModal
          won={gameState.won}
          score={gameState.score}
          moves={gameState.moves}
          onReset={() => {
            resetGame();
            setContinueAfterWin(false);
          }}
          onContinue={
            gameState.won && !gameState.gameOver
              ? () => setContinueAfterWin(true)
              : undefined
          }
        />
      )}

      {/* Rules Modal */}
      {showRules && (
        <RulesModal
          onClose={() => setShowRules(false)}
        />
      )}
    </div>
  );
}