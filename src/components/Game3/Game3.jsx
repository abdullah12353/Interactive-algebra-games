import React, { useState, useEffect } from 'react';
import './Game3.css';

const Game3 = () => {
  // Game state
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState('intro'); // intro, playing, success, failure, boss
  const [gameMode, setGameMode] = useState('story'); // story, speedrun
  const [timeLeft, setTimeLeft] = useState(60);
  const [storyProgress, setStoryProgress] = useState(0);
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  // Transformation parameters
  const [verticalShift, setVerticalShift] = useState(0);
  const [horizontalShift, setHorizontalShift] = useState(0);
  const [verticalStretch, setVerticalStretch] = useState(1);
  const [horizontalStretch, setHorizontalStretch] = useState(1);
  const [reflectX, setReflectX] = useState(false);
  const [reflectY, setReflectY] = useState(false);

  // Target function parameters (to match)
  const [targetParams, setTargetParams] = useState({
    verticalShift: 0,
    horizontalShift: 0,
    verticalStretch: 1,
    horizontalStretch: 1,
    reflectX: false,
    reflectY: false,
  });

  // Dialogue and narrative
  const [dialogue, setDialogue] = useState('');
  const [speaker, setSpeaker] = useState('Q-Bit');

  const storySegments = [
    {
      title: "Initialization",
      message:
        "Welcome to Neon Grid City, Graph Architect! I'm Q-Bit, your AI guide. Our city's functions have been corrupted by the rogue AI GL1TCH. We need your help to restore them!",
      speaker: "Q-Bit",
    },
    {
      title: "First Mission",
      message:
        "Let's start with something simple. This linear function powers the city's basic hologram displays. Use the vertical and horizontal shift controls to restore it!",
      speaker: "Q-Bit",
    },
    {
      title: "GL1TCH Appears",
      message:
        "01010111 ERROR! A new Graph Architect thinks they can fix MY beautiful chaos? How... amusing. Your efforts are futile!",
      speaker: "GL1TCH",
    },
    {
      title: "Professor's Guidance",
      message:
        "Don't let GL1TCH intimidate you. I'm Professor Waveform, and I'll teach you advanced transformation techniques. You'll need to master stretching and compression now.",
      speaker: "Professor Waveform",
    },
    {
      title: "Crisis Mode",
      message:
        "WARNING: CRITICAL FUNCTIONS DESTABILIZING! GL1TCH is targeting core city infrastructure. We need precise transformations now, Graph Architect!",
      speaker: "Q-Bit",
    },
    {
      title: "Final Confrontation",
      message:
        "You've made it to my central core, little Architect. My final function is impossibly complex - you'll never restore it in time! The Digital Realm will be MINE!",
      speaker: "GL1TCH",
    },
  ];

  // Generate graph data based on transformation parameters.
  // For speedrun mode, we use a larger x-range.
  const generateGraphData = (params) => {
    const data = [];
    const xMin = gameMode === 'speedrun' ? -15 : -10;
    const xMax = gameMode === 'speedrun' ? 15 : 10;
    for (let x = xMin; x <= xMax; x += 0.5) {
      let xTransformed = x - params.horizontalShift;
      xTransformed /= params.horizontalStretch;
      if (params.reflectY) xTransformed = -xTransformed;
      // Use different base functions for variety
      let y;
      if (level % 3 === 0) {
        y = Math.sin(xTransformed);
      } else if (level % 5 === 0) {
        y = Math.abs(xTransformed);
      } else {
        y = xTransformed * xTransformed;
      }
      y *= params.verticalStretch;
      if (params.reflectX) y = -y;
      y += params.verticalShift;
      // Add glitch effect if accuracy is low
      if (gameState === 'playing' && accuracy < 70) {
        const glitchAmount = ((100 - accuracy) / 100) * glitchIntensity;
        y += (Math.random() - 0.5) * glitchAmount;
      }
      data.push({ x, y });
    }
    return data;
  };

  const playerFunctionData = generateGraphData({
    verticalShift,
    horizontalShift,
    verticalStretch,
    horizontalStretch,
    reflectX,
    reflectY,
  });

  const targetFunctionData = generateGraphData(targetParams);

  // Generate a new target function based on level.
  const generateTargetFunction = () => {
    const complexity = Math.min(level * 0.5, 3);
    const newTarget = {
      verticalShift: Math.round((Math.random() * 6 - 3) * complexity),
      horizontalShift: Math.round((Math.random() * 6 - 3) * complexity),
      verticalStretch: Math.max(
        0.5,
        Math.round((Math.random() * 2 + 0.5) * complexity * 10) / 10
      ),
      horizontalStretch: Math.max(
        0.5,
        Math.round((Math.random() * 2 + 0.5) * complexity * 10) / 10
      ),
      reflectX: level > 2 && Math.random() > 0.7,
      reflectY: level > 3 && Math.random() > 0.7,
    };
    setTargetParams(newTarget);
    resetPlayerFunction();
    setGlitchIntensity(Math.min(level * 0.2, 2));
  };

  const resetPlayerFunction = () => {
    setVerticalShift(0);
    setHorizontalShift(0);
    setVerticalStretch(1);
    setHorizontalStretch(1);
    setReflectX(false);
    setReflectY(false);
  };

  const calculateAccuracy = () => {
    let totalError = 0;
    const points = 20;
    for (let i = 0; i < points; i++) {
      const playerY = playerFunctionData[i] ? playerFunctionData[i].y : 0;
      const targetY = targetFunctionData[i] ? targetFunctionData[i].y : 0;
      totalError += Math.abs(playerY - targetY);
    }
    const maxError = 100;
    const accuracyPercentage = Math.max(0, 100 - (totalError / maxError) * 100);
    return Math.round(accuracyPercentage);
  };

  const checkMatch = () => {
    const currentAccuracy = calculateAccuracy();
    setAccuracy(currentAccuracy);
    if (currentAccuracy >= 90) {
      setGameState('success');
      setScore(score + currentAccuracy * level);
      if (level % 5 === 0) {
        setDialogue("Excellent work! You've restored a critical function node!");
        setSpeaker("Professor Waveform");
      } else {
        const phrases = [
          "Function restored! The grid is stabilizing!",
          "Perfect match! Impressive transformation skills!",
          "Brilliant work! GL1TCH won't corrupt this one again!",
        ];
        setDialogue(phrases[Math.floor(Math.random() * phrases.length)]);
        setSpeaker("Q-Bit");
      }
      setTimeout(() => {
        if (level % 5 === 0 && storyProgress < storySegments.length - 1) {
          setStoryProgress(storyProgress + 1);
          setDialogue(storySegments[storyProgress + 1].message);
          setSpeaker(storySegments[storyProgress + 1].speaker);
          setTimeout(() => {
            setLevel(level + 1);
            setGameState('playing');
            generateTargetFunction();
          }, 3000);
        } else {
          setLevel(level + 1);
          setGameState('playing');
          generateTargetFunction();
        }
      }, 2000);
    }
  };

  const startGame = (mode) => {
    setGameMode(mode);
    setLevel(1);
    setScore(0);
    setGameState('playing');
    setTimeLeft(mode === 'speedrun' ? 120 : 60);
    setDialogue(storySegments[0].message);
    setSpeaker(storySegments[0].speaker);
    generateTargetFunction();
  };

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('failure');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      checkMatch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verticalShift, horizontalShift, verticalStretch, horizontalStretch, reflectX, reflectY]);

  const getHint = () => {
    if (targetParams.verticalShift > verticalShift) return "Try shifting your graph upward";
    if (targetParams.verticalShift < verticalShift) return "Try shifting your graph downward";
    if (targetParams.horizontalShift > horizontalShift) return "Try shifting your graph to the left";
    if (targetParams.horizontalShift < horizontalShift) return "Try shifting your graph to the right";
    if (targetParams.verticalStretch > verticalStretch) return "Try stretching your graph vertically";
    if (targetParams.verticalStretch < verticalStretch) return "Try compressing your graph vertically";
    if (targetParams.horizontalStretch > horizontalStretch) return "Try stretching your graph horizontally";
    if (targetParams.horizontalStretch < horizontalStretch) return "Try compressing your graph horizontally";
    if (targetParams.reflectX !== reflectX) return "Try reflecting your graph across the x-axis";
    if (targetParams.reflectY !== reflectY) return "Try reflecting your graph across the y-axis";
    return "You're very close! Make small adjustments.";
  };

  const getRankName = () => {
    if (level <= 2) return "Novice Architect";
    if (level <= 5) return "Function Apprentice";
    if (level <= 10) return "Graph Wizard";
    if (level <= 15) return "Master Transformer";
    return "Legendary Grid Savior";
  };

  // Build a string to display the current function f(x)
  const buildFunctionString = () => {
    const aStr = verticalStretch !== 1 ? verticalStretch : "";
    const shiftStr = horizontalShift !== 0 ? `(x - ${horizontalShift})` : "x";
    const hStr = horizontalStretch !== 1 ? ` / ${horizontalStretch}` : "";
    const squarePart = `${shiftStr}${hStr}²`;
    const vShiftStr = verticalShift !== 0 ? (verticalShift > 0 ? ` + ${verticalShift}` : ` - ${Math.abs(verticalShift)}`) : "";
    const reflectXStr = reflectX ? "-" : "";
    return `f(x) = ${reflectXStr}${aStr}${aStr && squarePart ? " * " : ""}${squarePart}${vShiftStr}`;
  };

  return (
    <div className="game3-container">
      {/* Intro Screen */}
      {gameState === 'intro' && (
        <div className="intro-screen">
          <h1 className="game-title">FUNCTION TRANSFORMER</h1>
          <p className="intro-text">
            In Neon Grid City, mathematical functions control everything—from holograms to energy flow.
            A rogue AI named GL1TCH has corrupted the function network.
            As a Graph Architect, you are chosen to restore the functions before the Digital Realm collapses!
          </p>
          <div className="game-modes-container">
            <button className="game-mode-button" onClick={() => startGame('story')}>
              Story Mode
            </button>
            <button className="game-mode-button" onClick={() => startGame('speedrun')}>
              Speedrun Mode
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'failure' && (
        <div className="game-over-screen">
          <h2 className="game-over-text">Function Network Collapsed!</h2>
          <p className="game-over-message">
            {score < 300
              ? "Don't worry, rookie Graph Architect! The Algorithmic Order still believes in you!"
              : score < 600
              ? "Not bad! You're showing promise as a Graph Architect. Neon Grid City needs you to keep training!"
              : "Impressive skills! You've proven yourself worthy of the title Master Graph Architect!"}
          </p>
          <p className="final-score-text">
            Final Score: <span className="final-score">{score}</span>
          </p>
          <button className="play-again-button" onClick={() => setGameState('intro')}>
            Try Again
          </button>
        </div>
      )}

      {/* Main Game Content */}
      {gameState !== 'intro' && (
        <>
          <header className="header-bar">
            <div className="header-left">
              <h1 className="title">Function Transformer</h1>
              <p className="subtitle">Level: {level} | Rank: {getRankName()}</p>
            </div>
            <div className="header-right">
              <p className="score-display">{score} pts</p>
              <p className="stats-display">Accuracy: {accuracy}% | Time: {timeLeft}s</p>
            </div>
          </header>

          {/* Display current function string */}
          <div className="function-display">
            <p>{buildFunctionString()}</p>
          </div>

          <div className="main-content">
            {/* Graph Area */}
            <div className="graph-area">
              <div className="graph-visualization">
                <div className="graph-canvas">
                  <div className="grid-lines"></div>
                  {/* Axis labels */}
                  <div className="axis-labels">
                    <span className="x-label">x</span>
                    <span className="y-label">y</span>
                  </div>
                  {/* Target Function Overlay */}
                  <div className="target-function-overlay">
                    <svg viewBox="0 0 400 200" width="100%" height="100%">
                      <path
                        d={`M ${targetFunctionData.map(point => `${20 * (point.x + 10)} ${200 - (point.y * 10 + 100)}`).join(' L ')}`}
                        className="target-path"
                      />
                    </svg>
                  </div>
                  {/* Player Function Overlay */}
                  <div className="player-function-overlay">
                    <svg viewBox="0 0 400 200" width="100%" height="100%">
                      <path
                        d={`M ${playerFunctionData.map(point => `${20 * (point.x + 10)} ${200 - (point.y * 10 + 100)}`).join(' L ')}`}
                        className="player-path"
                      />
                    </svg>
                  </div>
                  {/* Axes Overlay */}
                  <div className="axes-overlay">
                    <svg viewBox="0 0 400 200" width="100%" height="100%">
                      <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
                      <line x1="200" y1="0" x2="200" y2="200" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
                      {/* Axis labels as text */}
                      <text x="380" y="95" fill="#ffffff" fontSize="12">x</text>
                      <text x="210" y="15" fill="#ffffff" fontSize="12">y</text>
                    </svg>
                  </div>
                  {/* Success Overlay */}
                  {gameState === 'success' && (
                    <div className="success-overlay">
                      <div className="success-message">
                        Function Restored! +{accuracy * level} pts
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Dialogue Box */}
              {dialogue && gameState !== 'intro' && (
                <div className="dialogue-box">
                  <div className="dialogue-header">
                    <div className="speaker-avatar">
                      {speaker === 'Q-Bit' ? 'Q' : speaker === 'GL1TCH' ? 'G' : 'P'}
                    </div>
                    <span className="speaker-name">{speaker}</span>
                  </div>
                  <p>{dialogue}</p>
                </div>
              )}
            </div>
            {/* Control Panel */}
            <div className="control-panel">
              <h2 className="control-title">Transform Controls</h2>
              <div className="control-group">
                <div className="control-label">
                  <span>Vertical Shift</span>
                  <span className="control-value">{verticalShift}</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="1"
                  value={verticalShift}
                  onChange={(e) => setVerticalShift(parseInt(e.target.value))}
                  className="slider"
                />
              </div>
              <div className="control-group">
                <div className="control-label">
                  <span>Horizontal Shift</span>
                  <span className="control-value">{horizontalShift}</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="1"
                  value={horizontalShift}
                  onChange={(e) => setHorizontalShift(parseInt(e.target.value))}
                  className="slider"
                />
              </div>
              <div className="control-group">
                <div className="control-label">
                  <span>Vertical Stretch</span>
                  <span className="control-value">{verticalStretch}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={verticalStretch}
                  onChange={(e) => setVerticalStretch(parseFloat(e.target.value))}
                  className="slider"
                />
              </div>
              <div className="control-group">
                <div className="control-label">
                  <span>Horizontal Stretch</span>
                  <span className="control-value">{horizontalStretch}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={horizontalStretch}
                  onChange={(e) => setHorizontalStretch(parseFloat(e.target.value))}
                  className="slider"
                />
              </div>
              <div className="control-group">
                <div className="control-label">
                  <span>Reflect X</span>
                  <span className="control-value">{reflectX ? "On" : "Off"}</span>
                </div>
                <input
                  type="checkbox"
                  checked={reflectX}
                  onChange={(e) => setReflectX(e.target.checked)}
                  className="checkbox"
                />
              </div>
              <div className="control-group">
                <div className="control-label">
                  <span>Reflect Y</span>
                  <span className="control-value">{reflectY ? "On" : "Off"}</span>
                </div>
                <input
                  type="checkbox"
                  checked={reflectY}
                  onChange={(e) => setReflectY(e.target.checked)}
                  className="checkbox"
                />
              </div>
              <div className="button-group">
                <button className="button" onClick={resetPlayerFunction}>
                  Reset Function
                </button>
                <button className="button" onClick={() => setShowHint(!showHint)}>
                  Toggle Hint
                </button>
              </div>
              {showHint && <div className="hint-box">{getHint()}</div>}
              <div className="formula-bar">
                <p className="formula-text">
                  f(x) = {verticalStretch} · [ (x – {horizontalShift}) / {horizontalStretch} ]² {verticalShift >= 0 ? `+ ${verticalShift}` : `- ${Math.abs(verticalShift)}`}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Game3;
