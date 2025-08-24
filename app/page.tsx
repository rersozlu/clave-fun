"use client";
import React, { useState, useEffect, useCallback } from "react";

interface GameStepData {
  rowSize: number;
  explodingBoxIndex: number;
  totalMultiplier: number;
  isCompleted: boolean;
  isExploded: boolean;
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
    const houseEdge: number = 0.1;
    const tempGameData: GameStepData[] = [];
    let previousMultiplier: number = 1;

    let boxSizes: number[] = [];
    for (let i = 3; i <= 7; i++) {
      for (let j = 0; j < 5; j++) {
        boxSizes.push(i);
      }
    }

    boxSizes = shuffleArray(boxSizes);

    for (let i = 0; i < 25; i++) {
      const rowSize: number = boxSizes[i];
      const explodingBoxIndex: number = Math.floor(Math.random() * rowSize);
      const winProbability: number = (rowSize - 1) / rowSize;
      const fairMultiplier: number = 1 / winProbability;
      const stepMultiplier: number = fairMultiplier * (1 - houseEdge);
      const totalMultiplier: number = previousMultiplier * stepMultiplier;

      tempGameData.push({
        rowSize,
        explodingBoxIndex,
        totalMultiplier: parseFloat(totalMultiplier.toFixed(2)),
        isCompleted: false,
        isExploded: false,
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

    const currentStepData = gameData[currentStep];

    if (boxIndex === currentStepData.explodingBoxIndex) {
      const updatedGameData = [...gameData];
      updatedGameData[currentStep].isExploded = true;
      setGameData(updatedGameData);
      setGameState("lost");
      setCurrentMultiplier(0);
    } else {
      const updatedGameData = [...gameData];
      updatedGameData[currentStep].isCompleted = true;
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
    <div className="bg-gray-800 text-gray-200 font-sans text-center p-8 rounded-xl max-w-3xl mx-auto my-10">
      <h1 className="text-3xl font-bold mb-6">Clave Fun</h1>
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-700 rounded-lg">
        <p className="text-xl">
          Multiplier:
          <span className="font-bold text-green-400">{currentMultiplier.toFixed(2)}x</span>
        </p>
        <p className="text-xl">
          Step: <span className="font-bold">{currentStep + 1} / 25</span>
        </p>
        <p className="px-6 py-2 text-lg font-semibold text-white bg-green-600 rounded-lg shadow-md transition-colors">
          {currentStep === 0 ? "Earnings" : `Earned (${currentMultiplier.toFixed(2)}x)`}
        </p>
      </div>

      <button
        onClick={handleCashOut}
        className="px-6 py-2 cursor-pointer text-lg font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        disabled={currentStep === 0 || gameState !== "playing"}
      >
        {currentStep === 0 ? "Cash Out" : `Cash Out (${currentMultiplier.toFixed(2)}x)`}
      </button>

      <button
        onClick={setupGame}
        className="px-6 py-2 cursor-pointer text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none transition-colors mb-6 ml-4"
      >
        Restart
      </button>

      <div className="space-y-4">
        {gameData.map((stepData, stepIndex) => (
          <div
            key={stepIndex}
            className={`
              p-4 rounded-lg flex items-center gap-4 transition-all duration-300
              ${
                stepIndex === currentStep && gameState === "playing"
                  ? "bg-gray-700 shadow-lg scale-105"
                  : "bg-gray-900"
              }
              ${stepData.isCompleted ? "opacity-50" : ""}
              ${stepData.isExploded ? "border-2 border-red-500" : ""}
            `}
          >
            <span className="font-bold text-lg w-20 text-left">
              {stepData.totalMultiplier.toFixed(2)}x
            </span>
            <div className="flex-1 flex justify-center gap-2">
              {Array.from({ length: stepData.rowSize }, (_, boxIndex) => (
                <div
                  key={boxIndex}
                  onClick={() => stepIndex === currentStep && handleBoxClick(boxIndex)}
                  className={`
                    w-10 h-10 flex items-center justify-center rounded-md text-xl font-bold
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
                  {stepData.isExploded && boxIndex === stepData.explodingBoxIndex ? "💥" : "?"}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {gameState === "lost" && (
        <h2 className="text-2xl font-bold text-red-500 my-4">Kaybettin! Çarpan sıfırlandı.</h2>
      )}
      {gameState === "won" && (
        <h2 className="text-2xl font-bold text-green-500 my-4">
          Kazandın! Toplam çarpan: {currentMultiplier.toFixed(2)}x
        </h2>
      )}
    </div>
  );
};

export default Game;
