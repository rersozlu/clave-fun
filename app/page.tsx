"use client";
import React, { useState, useEffect, useCallback } from "react";

interface GameStepData {
  rowSize: number;
  explodingBoxIndex: number;
  totalMultiplier: number;
  isCompleted: boolean;
  isExploded: boolean;
  selectedBoxIndex: number | null;
}

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [gameData, setGameData] = useState<GameStepData[]>([]);

  useEffect(() => {
    setupGame();
  }, []);

  const setupGame = useCallback(() => {
    const tempGameData: GameStepData[] = [];
    let previousMultiplier: number = 1;

    let boxSizes: number[] = [];
    // Yeni kutu dağılımı
    for (let i = 0; i < 6; i++) boxSizes.push(3);
    for (let i = 0; i < 5; i++) boxSizes.push(4);
    for (let i = 0; i < 5; i++) boxSizes.push(5);
    for (let i = 0; i < 5; i++) boxSizes.push(6);
    for (let i = 0; i < 4; i++) boxSizes.push(7);

    boxSizes = shuffleArray(boxSizes);

    for (let i = 0; i < 25; i++) {
      const rowSize: number = boxSizes[i];
      const explodingBoxIndex: number = Math.floor(Math.random() * rowSize);
      const winProbability: number = (rowSize - 1) / rowSize;
      const fairMultiplier: number = 1 / winProbability;

      let houseEdge: number = 0;

      // Kutu sayısına göre kasa avantajı ayarı
      if (rowSize >= 4 && rowSize <= 7) {
        houseEdge = 0.1;
      } else if (rowSize === 3) {
        houseEdge = 0.05;
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
    setGameState("playing");
    setCurrentStep(0);
    setCurrentMultiplier(1);
  }, [setGameData, setGameState, setCurrentStep, setCurrentMultiplier]);

  const shuffleArray = (array: number[]): number[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleBoxClick = (boxIndex: number): void => {
    if (gameState !== "playing" || currentStep >= gameData.length) return;

    const updatedGameData = [...gameData];
    const currentStepData = updatedGameData[currentStep];
    currentStepData.selectedBoxIndex = boxIndex;

    if (boxIndex === currentStepData.explodingBoxIndex) {
      currentStepData.isExploded = true;
      setGameData(updatedGameData);
      setGameState("lost");
      setCurrentMultiplier(0);
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
        setGameState("won");
      }
    }
  };

  const handleCashOut = (): void => {
    if (gameState !== "playing") return;
    setGameState("won");
  };

  return (
    <div className="bg-gray-800 text-gray-200 font-sans text-center p-4 sm:p-8 rounded-xl max-w-full sm:max-w-3xl mx-auto my-4 sm:my-10">
      <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">Clave Fun</h1>
      <div className="flex flex-col sm:flex-row justify-between items-center sm:mb-6 p-3 sm:p-4 bg-gray-700 rounded-lg">
        <p className="text-base sm:text-xl">
          Multiplier:
          <span className="font-bold text-green-400">{currentMultiplier.toFixed(2)}x</span>
        </p>
        <p className="text-base sm:text-xl mt-2 sm:mt-0">
          Step: <span className="font-bold">{currentStep + 1} / 25</span>
        </p>
        <p className="px-4 py-1 sm:px-6 sm:py-2 text-base sm:text-lg font-semibold text-white bg-green-600 rounded-lg shadow-md transition-colors mt-2 sm:mt-0">
          {currentStep === 0 ? "Earnings" : `Earned (${currentMultiplier.toFixed(2)}x)`}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={handleCashOut}
          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-lg font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          disabled={currentStep === 0 || gameState !== "playing"}
        >
          {currentStep === 0 ? "Cash Out" : `Cash Out (${currentMultiplier.toFixed(2)}x)`}
        </button>
        <button
          onClick={setupGame}
          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none transition-colors"
        >
          Restart
        </button>
      </div>

      <div className="space-y-2 sm:space-y-4">
        {gameData.map((stepData, stepIndex) => (
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
      {gameState === "won" && (
        <h2 className="text-xl sm:text-2xl font-bold text-green-500 my-4">
          Won! Total multiplier: {currentMultiplier.toFixed(2)}x
        </h2>
      )}
    </div>
  );
};

export default Game;
