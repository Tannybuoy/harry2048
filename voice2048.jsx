import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Wand2, Sparkles } from 'lucide-react';

const HarryPotter2048 = () => {
  const [grid, setGrid] = useState(initializeGrid());
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [listening, setListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [animatingTiles, setAnimatingTiles] = useState({});
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);

  const TILE_NAMES = {
    2: { name: 'Wand', emoji: '🪄', color: 'bg-amber-100', text: 'text-amber-900' },
    4: { name: 'Spellbook', emoji: '📖', color: 'bg-amber-200', text: 'text-amber-900' },
    8: { name: 'Owl', emoji: '🦉', color: 'bg-orange-300', text: 'text-amber-900' },
    16: { name: 'Potion', emoji: '🧪', color: 'bg-orange-400', text: 'text-white' },
    32: { name: 'Broomstick', emoji: '🧹', color: 'bg-orange-500', text: 'text-white' },
    64: { name: 'House Crest', emoji: '🏛️', color: 'bg-red-500', text: 'text-white' },
    128: { name: 'Patronus', emoji: '✨', color: 'bg-purple-500', text: 'text-white' },
    256: { name: 'Quidditch Trophy', emoji: '🏆', color: 'bg-purple-600', text: 'text-white' },
    512: { name: 'Invisibility Cloak', emoji: '👻', color: 'bg-indigo-600', text: 'text-white' },
    1024: { name: 'Horcrux', emoji: '💀', color: 'bg-red-700', text: 'text-yellow-300' },
    2048: { name: 'Elder Wand', emoji: '⭐', color: 'bg-yellow-400', text: 'text-amber-900' },
  };

  function initializeGrid() {
    const newGrid = Array(4)
      .fill(null)
      .map(() => Array(4).fill(0));
    addNewTile(newGrid, false);
    addNewTile(newGrid, false);
    return newGrid;
  }

  function addNewTile(currentGrid, animate = true) {
    const empty = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentGrid[i][j] === 0) empty.push([i, j]);
      }
    }
    if (empty.length > 0) {
      const [i, j] = empty[Math.floor(Math.random() * empty.length)];
      const newValue = Math.random() < 0.9 ? 2 : 4;
      currentGrid[i][j] = newValue;

      if (animate) {
        setAnimatingTiles(prev => ({
          ...prev,
          [`${i}-${j}`]: 'pop',
        }));

        setTimeout(() => {
          setAnimatingTiles(prev => {
            const newState = { ...prev };
            delete newState[`${i}-${j}`];
            return newState;
          });
        }, 300);
      }
    }
  }

  function moveAndMerge(currentGrid, direction) {
    const newGrid = currentGrid.map(row => [...row]);
    let moved = false;
    let newScore = 0;
    const mergedPositions = new Set();

    const rotate = (g, times) => {
      let result = g;
      for (let i = 0; i < times; i++) {
        result = result[0].map((_, colIndex) =>
          result.map(row => row[colIndex]).reverse()
        );
      }
      return result;
    };

    const slideAndMerge = (row, rowIndex) => {
      const compressed = [];
      const sourceIndices = [];
      
      for (let i = 0; i < row.length; i++) {
        if (row[i] !== 0) {
          compressed.push(row[i]);
          sourceIndices.push(i);
        }
      }
      
      const merged = [];
      const mergedIndices = [];
      
      for (let i = 0; i < compressed.length; i++) {
        if (i < compressed.length - 1 && compressed[i] === compressed[i + 1]) {
          const merged_val = compressed[i] * 2;
          merged.push(merged_val);
          mergedIndices.push(i);
          newScore += merged_val;
          i++;
        } else {
          merged.push(compressed[i]);
        }
      }
      
      while (merged.length < 4) merged.push(0);
      return { row: merged, mergedIndices };
    };

    let rotated = newGrid;
    let rotations = 0;

    if (direction === 'right') rotations = 2;
    else if (direction === 'up') rotations = 3;
    else if (direction === 'down') rotations = 1;

    rotated = rotate(rotated, rotations);

    for (let i = 0; i < 4; i++) {
      const original = [...rotated[i]];
      const { row: newRow, mergedIndices } = slideAndMerge(rotated[i], i);
      rotated[i] = newRow;
      
      mergedIndices.forEach(idx => {
        mergedPositions.add(`${i}-${idx}`);
      });
      
      if (original.some((val, idx) => val !== rotated[i][idx])) moved = true;
    }

    rotated = rotate(rotated, (4 - rotations) % 4);

    if (moved) {
      addNewTile(rotated);
      setScore(prev => prev + newScore);
      setMoves(prev => prev + 1);
      
      mergedPositions.forEach(pos => {
        const [i, j] = pos.split('-').map(Number);
        setAnimatingTiles(prev => ({
          ...prev,
          [pos]: 'merge',
        }));
        setTimeout(() => {
          setAnimatingTiles(prev => {
            const newState = { ...prev };
            delete newState[pos];
            return newState;
          });
        }, 400);
      });
      
      setGrid(rotated);
      checkGameState(rotated);
      playSound('merge');
    }
    return moved;
  }

  function checkGameState(currentGrid) {
    let hasEmpty = false;
    let canMove = false;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentGrid[i][j] === 0) hasEmpty = true;
        if (currentGrid[i][j] === 2048) setWon(true);

        if (i < 3 && currentGrid[i][j] === currentGrid[i + 1][j])
          canMove = true;
        if (j < 3 && currentGrid[i][j] === currentGrid[i][j + 1])
          canMove = true;
      }
    }

    if (!hasEmpty && !canMove) setGameOver(true);
  }

  function handleMove(direction) {
    if (gameOver || won) return;
    moveAndMerge(grid, direction);
  }

  function playSound(type) {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'move') {
      osc.frequency.value = 523;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'merge') {
      osc.frequency.value = 659;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'listen') {
      osc.frequency.value = 587;
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  }

  function resetGame() {
    setGrid(initializeGrid());
    setScore(0);
    setMoves(0);
    setGameOver(false);
    setWon(false);
    setLastCommand('');
    setAnimatingTiles({});
  }

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceEnabled(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setListening(true);
      playSound('listen');
    };

    recognition.onresult = event => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i].transcript.toLowerCase().trim();
        if (event.results[i].isFinal) {
          const command = parseCommand(transcript);
          if (command) {
            setLastCommand(transcript);
            handleMove(command);
          }
        }
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setTimeout(() => recognition.start(), 500);
    };

    recognitionRef.current = recognition;
    recognition.start();

    return () => recognition.abort();
  }, [grid, gameOver, won]);

  function parseCommand(text) {
    const directionMap = {
      up: ['up', 'north', 'go up', 'move up'],
      down: ['down', 'south', 'go down', 'move down'],
      left: ['left', 'west', 'go left', 'move left'],
      right: ['right', 'east', 'go right', 'move right'],
    };

    for (const [direction, keywords] of Object.entries(directionMap)) {
      if (keywords.some(k => text.includes(k))) return direction;
    }
    return null;
  }

  const getTileSize = value => {
    if (value === 0) return 'text-transparent';
    if (value < 10) return 'text-4xl';
    if (value < 100) return 'text-3xl';
    if (value < 1000) return 'text-2xl';
    return 'text-xl';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 text-amber-50 flex flex-col items-center justify-center p-6 overflow-hidden" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
        
        .tile-pop {
          animation: tile-pop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        @keyframes tile-pop {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        .tile-merge {
          animation: tile-merge 0.4s ease-out;
        }
        
        @keyframes tile-merge {
          0% { transform: scale(1); }
          50% { transform: scale(1.15) rotate(-5deg); }
          100% { transform: scale(1); }
        }
        
        .listening-pulse {
          animation: listening-pulse 1.2s ease-in-out infinite;
        }
        
        @keyframes listening-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        
        .hogwarts-glow {
          text-shadow: 0 0 10px rgba(217, 119, 6, 0.8), 0 0 20px rgba(217, 119, 6, 0.4);
        }
        
        .tile-border {
          border: 2px solid rgba(217, 119, 6, 0.4);
          box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.3);
        }
        
        button:active {
          transform: scale(0.97);
        }
      `}</style>

      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Wand2 size={32} className="text-amber-300" />
            <h1 className="text-5xl font-black hogwarts-glow" style={{ fontFamily: '"Cinzel", serif' }}>
              2048
            </h1>
            <Sparkles size={32} className="text-amber-300" />
          </div>
          <p className="text-amber-300 text-sm tracking-widest">WIZARDING WORLD</p>
        </div>

        <div className="mb-6 flex justify-between items-center bg-amber-900 bg-opacity-80 p-6 rounded-lg border-2 border-amber-600">
          <div>
            <p className="text-amber-300 text-xs uppercase tracking-wider mb-1">Score</p>
            <p className="text-4xl font-bold text-amber-100">{score}</p>
          </div>
          <div>
            <p className="text-amber-300 text-xs uppercase tracking-wider mb-1">Moves</p>
            <p className="text-4xl font-bold text-amber-100">{moves}</p>
          </div>
        </div>

        <div className="mb-6 bg-amber-900 bg-opacity-70 p-5 rounded-lg border-2 border-amber-500">
          <div className="flex items-center justify-between mb-3">
            <p className="text-amber-300 text-xs uppercase tracking-wider font-semibold">Voice Input</p>
            {voiceEnabled ? (
              <Volume2 size={18} className={listening ? 'text-yellow-300 listening-pulse' : 'text-amber-400'} />
            ) : (
              <VolumeX size={18} className="text-amber-400" />
            )}
          </div>
          <div className="min-h-6 text-center">
            {!voiceEnabled ? (
              <p className="text-amber-300 text-sm">Voice not supported</p>
            ) : listening ? (
              <p className="text-yellow-300 text-sm font-semibold animate-pulse">Listening...</p>
            ) : (
              <p className="text-amber-400 text-sm">Say: up, down, left, right</p>
            )}
          </div>
          {lastCommand && (
            <div className="mt-3 p-2 bg-amber-950 border border-amber-500 text-amber-300 text-sm text-center rounded">
              "{lastCommand}"
            </div>
          )}
        </div>

        <div className="bg-amber-950 p-3 rounded-xl tile-border mb-8 backdrop-blur-sm">
          <div className="grid grid-cols-4 gap-2">
            {grid.map((row, i) => {
              return row.map((value, j) => {
                const info = TILE_NAMES[value] || TILE_NAMES[2];
                const tileKey = `${i}-${j}`;
                const animation = animatingTiles[tileKey];
                
                return (
                  <div
                    key={tileKey}
                    className={`aspect-square flex flex-col items-center justify-center font-bold rounded-lg transition-all tile-border ${info.color} ${info.text} ${
                      animation === 'pop' ? 'tile-pop' : ''
                    } ${animation === 'merge' ? 'tile-merge' : ''}`}
                  >
                    {value > 0 && (
                      <>
                        <span className={getTileSize(value)}>{info.emoji}</span>
                        <span className="text-xs mt-1 font-semibold">{value}</span>
                      </>
                    )}
                  </div>
                );
              });
            })}
          </div>
        </div>

        <button
          onClick={resetGame}
          className="w-full py-4 bg-amber-700 hover:bg-amber-600 text-amber-50 font-bold text-lg rounded-xl transition border-2 border-amber-600 mb-3"
        >
          New Game
        </button>

        <p className="text-center text-amber-400 text-xs mb-4">Merge tiles to reach the Elder Wand</p>

        {gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gradient-to-b from-amber-900 to-amber-950 border-4 border-amber-600 p-8 rounded-2xl text-center max-w-sm">
              <p className="text-amber-300 text-3xl font-black mb-2 hogwarts-glow">Game Over</p>
              <p className="text-amber-100 mb-6 text-lg">{score} points in {moves} moves</p>
              <button
                onClick={resetGame}
                className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-amber-50 font-bold rounded-lg transition border border-amber-600"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {won && !gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gradient-to-b from-yellow-700 to-amber-900 border-4 border-yellow-400 p-8 rounded-2xl text-center max-w-sm shadow-2xl">
              <p className="text-yellow-200 text-4xl font-black mb-2">⭐ ELDER WAND ⭐</p>
              <p className="text-amber-100 mb-6 text-lg">{score} points in {moves} moves</p>
              <button
                onClick={resetGame}
                className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-amber-950 font-bold rounded-lg transition border border-yellow-400"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HarryPotter2048;
