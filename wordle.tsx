"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const WORD_LIST = [
  "apple",
  "beach",
  "chair",
  "dance",
  "eagle",
  "flame",
  "grape",
  "house",
  "ivory",
  "jelly",
  "lemon",
  "mango",
  "noble",
  "ocean",
  "piano",
  "quiet",
  "river",
  "solar",
  "table",
  "umbra",
  "viola",
  "water",
  "xerox",
  "yacht",
  "zebra",
  "bread",
  "cloud",
  "dream",
  "earth",
  "flute",
  "ghost",
  "heart",
  "image",
  "juice",
];

const MAX_ATTEMPTS = 6;
const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"],
];

export default function Component() {
  const [secretWord, setSecretWord] = useState("");
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing",
  );
  const [message, setMessage] = useState("");
  const [keyboardColors, setKeyboardColors] = useState<Record<string, string>>(
    {},
  );
  const [revealIndex, setRevealIndex] = useState(-1);

  useEffect(() => {
    setSecretWord(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
  }, []);

  const handleGuess = useCallback(() => {
    if (currentGuess.length !== 5) {
      setMessage("Your guess must be 5 letters long.");
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    updateKeyboardColors(currentGuess);
    setCurrentGuess("");
    setMessage("");
    setRevealIndex(0);

    if (currentGuess === secretWord) {
      setGameStatus("won");
      setMessage("Congratulations! You've guessed the word correctly!");
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setGameStatus("lost");
      setMessage(`Game Over. The word was: ${secretWord}`);
    }
  }, [currentGuess, guesses, secretWord]);

  useEffect(() => {
    if (revealIndex >= 0 && revealIndex < 5) {
      const timer = setTimeout(() => {
        setRevealIndex(revealIndex + 1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [revealIndex]);

  const getCharFrequency = (word: string) => {
    return word.split("").reduce(
      (acc, char) => {
        acc[char] = (acc[char] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  };

  const getLetterColors = (guess: string) => {
    const colors: string[] = Array(5).fill("bg-gray-200");
    const charFreq = getCharFrequency(secretWord);

    // First pass: mark correct positions
    for (let i = 0; i < 5; i++) {
      if (guess[i] === secretWord[i]) {
        colors[i] = "bg-green-500";
        charFreq[guess[i]]--;
      }
    }

    // Second pass: mark correct letters in wrong positions
    for (let i = 0; i < 5; i++) {
      if (colors[i] === "bg-gray-200" && charFreq[guess[i]] > 0) {
        colors[i] = "bg-yellow-500";
        charFreq[guess[i]]--;
      }
    }

    return colors;
  };

  const updateKeyboardColors = (guess: string) => {
    const colors = getLetterColors(guess);
    const newKeyboardColors = { ...keyboardColors };

    for (let i = 0; i < 5; i++) {
      const letter = guess[i];
      const color = colors[i];

      if (
        color === "bg-green-500" ||
        (color === "bg-yellow-500" &&
          newKeyboardColors[letter] !== "bg-green-500")
      ) {
        newKeyboardColors[letter] = color;
      } else if (color === "bg-gray-200" && !newKeyboardColors[letter]) {
        newKeyboardColors[letter] = "bg-gray-500";
      }
    }

    setKeyboardColors(newKeyboardColors);
  };

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameStatus !== "playing") return;

      if (key === "enter") {
        handleGuess();
      } else if (key === "backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (currentGuess.length < 5 && /^[a-z]$/.test(key)) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [gameStatus, handleGuess, currentGuess],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleKeyPress("enter");
      } else if (e.key === "Backspace") {
        handleKeyPress("backspace");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toLowerCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  const resetGame = () => {
    setSecretWord(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
    setCurrentGuess("");
    setGuesses([]);
    setGameStatus("playing");
    setMessage("");
    setKeyboardColors({});
    setRevealIndex(-1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8">Wordle Clone</h1>
      <div className="mb-8 grid grid-rows-6 gap-2">
        {[...Array(MAX_ATTEMPTS)].map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, colIndex) => {
              const letter = guesses[rowIndex]?.[colIndex] || "";
              const isCurrentGuess = rowIndex === guesses.length;
              const shouldReveal =
                rowIndex === guesses.length - 1 && colIndex <= revealIndex;
              const color = shouldReveal
                ? getLetterColors(guesses[rowIndex])[colIndex]
                : "bg-white";
              return (
                <motion.div
                  key={colIndex}
                  className={`w-14 h-14 flex items-center justify-center text-2xl font-bold rounded border-2 ${
                    isCurrentGuess ? "border-gray-400" : "border-gray-200"
                  } ${color}`}
                  initial={shouldReveal ? { rotateX: 0 } : false}
                  animate={shouldReveal ? { rotateX: [0, 90, 0] } : {}}
                  transition={{ duration: 0.3, delay: colIndex * 0.1 }}
                >
                  {letter.toUpperCase()}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
      {gameStatus === "playing" && (
        <div className="mb-4 text-2xl font-bold">
          Current Guess: {currentGuess.toUpperCase()}
        </div>
      )}
      {gameStatus !== "playing" && (
        <Button onClick={resetGame} className="mb-4">
          Play Again
        </Button>
      )}
      {message && (
        <div className="mb-4 text-center font-semibold">{message}</div>
      )}
      <div className="text-sm text-gray-500 mb-4">
        Guesses remaining: {MAX_ATTEMPTS - guesses.length}
      </div>
      <div className="w-full max-w-3xl">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center mb-2">
            {row.map((key) => (
              <Button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`mx-1 ${
                  key === "enter" || key === "backspace" ? "px-4" : "w-10 h-14"
                } ${keyboardColors[key] || "bg-gray-300"}`}
                disabled={gameStatus !== "playing"}
              >
                {key === "backspace" ? "←" : key.toUpperCase()}
              </Button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
