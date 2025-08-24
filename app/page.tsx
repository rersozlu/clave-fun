"use client";
import React, { useState, useCallback, useEffect } from "react";

interface GameStepData {
  rowSize: number;
  explodingBoxIndex: number;
  totalMultiplier: number;
  isCompleted: boolean;
  isExploded: boolean;
  selectedBoxIndex: number | null;
}

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<"not-started" | "playing" | "lost">("not-started");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [gameData, setGameData] = useState<GameStepData[]>([]);

  const [totalWon, setTotalWon] = useState<number>(0);
  const [totalLost, setTotalLost] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number | null>(null);

  useEffect(() => {
    setupGame();
  }, []);

  const setupGame = useCallback(() => {
    const tempGameData: GameStepData[] = [];
    let previousMultiplier: number = 1;

    const smallBoxSizes = Array.from({ length: 15 }, () => Math.floor(Math.random() * 3) + 2);
    const largeBoxSizes = Array.from({ length: 10 }, () => Math.floor(Math.random() * 3) + 5);

    let boxSizes = [...smallBoxSizes, ...largeBoxSizes];
    boxSizes = shuffleArray(boxSizes);

    for (let i = 0; i < 25; i++) {
      const rowSize: number = boxSizes[i];
      const explodingBoxIndex: number = Math.floor(Math.random() * rowSize);
      const winProbability: number = (rowSize - 1) / rowSize;
      const fairMultiplier: number = 1 / winProbability;

      let houseEdge: number;
      if (rowSize === 2) {
        houseEdge = 0;
      } else if (rowSize >= 3 && rowSize <= 4) {
        houseEdge = 0.05;
      } else {
        houseEdge = 0.1;
      }

      const stepMultiplier: number = fairMultiplier * (1 - houseEdge);
      const totalMultiplier: number = previousMultiplier * stepMultiplier;

      tempGameData.push({
        rowSize,
        explodingBoxIndex,
        totalMultiplier: parseFloat(totalMultiplier.toFixed(2)),
        isCompleted: false,
        isExploded: false,
        selectedBoxIndex: null,
      });

      previousMultiplier = totalMultiplier;
    }

    setGameData(tempGameData);
    setCurrentStep(0);
    setCurrentMultiplier(1);
    setGameState("playing");
  }, []);

  const shuffleArray = (array: number[]): number[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleBoxClick = (boxIndex: number): void => {
    if (
      gameState !== "playing" ||
      currentStep >= gameData.length ||
      betAmount === null ||
      betAmount <= 0
    ) {
      if (betAmount === null || betAmount <= 0) {
        alert("Please enter a valid bet amount!");
      }
      return;
    }

    const updatedGameData = [...gameData];
    const currentStepData = updatedGameData[currentStep];
    currentStepData.selectedBoxIndex = boxIndex;

    if (boxIndex === currentStepData.explodingBoxIndex) {
      currentStepData.isExploded = true;
      setGameData(updatedGameData);
      setGameState("lost");
      setCurrentMultiplier(0);
      setTotalLost((prev) => prev + betAmount);
    } else {
      currentStepData.isCompleted = true;
      setGameData(updatedGameData);

      const nextStep = currentStep + 1;
      const nextMultiplier = currentStepData.totalMultiplier;
      setCurrentMultiplier(nextMultiplier);

      if (nextStep < gameData.length) {
        setTimeout(() => {
          setCurrentStep(nextStep);
        }, 300);
      } else {
        const winnings = betAmount * nextMultiplier;
        setTotalWon((prev) => prev + (winnings - betAmount));
      }
    }
  };

  const handleCashOut = (): void => {
    if (gameState !== "playing" || betAmount === null) return;
    const winnings = betAmount * currentMultiplier;
    setTotalWon((prev) => prev + (winnings - betAmount));
    setupGame();
  };

  const cashOutAmount = betAmount !== null ? (betAmount * currentMultiplier).toFixed(2) : "0.00";
  const totalWinAmount = totalWon.toFixed(2);
  const totalLostAmount = totalLost.toFixed(2);

  return (
    <div className="bg-gray-800 text-gray-200 font-sans text-center p-4 sm:p-8 rounded-xl max-w-full sm:max-w-3xl mx-auto my-4 sm:my-10">
      <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">Clave Fun</h1>

      <div className="flex justify-between items-center mb-4 text-sm sm:text-base">
        <p className="font-semibold text-green-400">Total Won: ${totalWinAmount}</p>
        <p className="font-semibold text-red-400">Total Lost: ${totalLostAmount}</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mb-4">
        <input
          type="number"
          placeholder="Enter Bet Amount"
          value={betAmount === null ? "" : betAmount}
          onChange={(e) => setBetAmount(parseFloat(e.target.value))}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
        />
      </div>

      {gameState !== "not-started" && (
        <div className="flex flex-col sm:flex-row justify-between items-center sm:mb-6 p-3 sm:p-4 bg-gray-700 rounded-lg">
          <p className="text-base sm:text-xl">
            Multiplier:
            <span className="font-bold text-green-400">{currentMultiplier.toFixed(2)}x</span>
          </p>
          <p className="text-base sm:text-xl mt-2 sm:mt-0">
            Bet: <span className="font-bold">${betAmount?.toFixed(2)}</span>
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={handleCashOut}
          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-lg font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          disabled={currentStep === 0 || gameState !== "playing"}
        >
          {currentStep === 0 ? "Cash Out" : `Cash Out ($${cashOutAmount})`}
        </button>
        <button
          onClick={setupGame}
          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none transition-colors"
        >
          Restart
        </button>
      </div>

      <div className="space-y-2 sm:space-y-4">
        {gameData.length > 0 &&
          gameData.map((stepData, stepIndex) => (
            <div
              key={stepIndex}
              className={`
              p-3 sm:p-4 rounded-lg flex flex-wrap items-center justify-center sm:flex-nowrap sm:justify-start gap-2 sm:gap-4 transition-all duration-300
              ${
                stepIndex === currentStep && gameState === "playing"
                  ? "bg-gray-700 shadow-lg scale-105"
                  : "bg-gray-900"
              }
              ${stepData.isCompleted ? "opacity-50" : ""}
              ${stepData.isExploded ? "border-2 border-red-500" : ""}
            `}
            >
              <span className="font-bold text-base sm:text-lg w-full sm:w-20 text-center sm:text-left mb-2 sm:mb-0">
                {stepData.totalMultiplier.toFixed(2)}x
              </span>
              <div className="flex-1 flex flex-wrap justify-center gap-2">
                {Array.from({ length: stepData.rowSize }, (_, boxIndex) => (
                  <div
                    key={boxIndex}
                    onClick={() => stepIndex === currentStep && handleBoxClick(boxIndex)}
                    className={`
                    w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-md text-base sm:text-xl font-bold
                    ${
                      stepIndex === currentStep && gameState === "playing"
                        ? "bg-gray-600 cursor-pointer hover:bg-gray-500"
                        : "bg-gray-600/30 cursor-not-allowed"
                    }
                    ${
                      stepData.isExploded && boxIndex === stepData.explodingBoxIndex
                        ? "bg-red-500"
                        : ""
                    }
                  `}
                  >
                    {stepData.isExploded && boxIndex === stepData.explodingBoxIndex
                      ? "💥"
                      : stepData.isCompleted && boxIndex === stepData.selectedBoxIndex
                      ? "✅"
                      : "?"}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {gameState === "lost" && (
        <h2 className="text-xl sm:text-2xl font-bold text-red-500 my-4">Lost! Multiplier reset.</h2>
      )}
    </div>
  );
};

export default Game;
