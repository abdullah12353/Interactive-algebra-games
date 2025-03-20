import React, { useState } from 'react';
import './Game6.css';

const Game6 = () => {
  // Tree parameters: h(t) = a*t² + b*t + c, affecting tree heights.
  const [treeA, setTreeA] = useState(0.02);
  const [treeB, setTreeB] = useState(0.5);
  const [treeC, setTreeC] = useState(1);

  // River parameters: y = A*sin(B*x + C) + D, controlling river shape.
  const [riverA, setRiverA] = useState(5);
  const [riverB, setRiverB] = useState(1);
  const [riverC, setRiverC] = useState(0);
  const [riverD, setRiverD] = useState(10);

  // Dimensions for the simulation area.
  const svgWidth = 600;
  const svgHeight = 400;

  // Render trees as rectangles. We'll simulate 10 trees.
  const renderTrees = () => {
    const trees = [];
    const numTrees = 10;
    const spacing = svgWidth / (numTrees + 1);
    for (let i = 1; i <= numTrees; i++) {
      // Compute height with the quadratic function. (i represents a pseudo-time/index)
      const heightValue = treeA * i * i + treeB * i + treeC;
      // Scale height to pixels (multiply by 50 for visible effect).
      const treeHeight = heightValue * 50;
      // Place the tree so that its base is 20px above the bottom.
      const x = spacing * i;
      const y = svgHeight - treeHeight - 20;
      trees.push(
        <rect
          key={i}
          x={x - 10} // Tree width of 20px.
          y={y}
          width={20}
          height={treeHeight}
          fill="#00ff00"
          stroke="#ffffff"
          strokeWidth="1"
        />
      );
    }
    return trees;
  };

  // Render the river as a sine wave path.
  const renderRiver = () => {
    let pathData = "";
    const numPoints = 100;
    for (let i = 0; i <= numPoints; i++) {
      const x = (svgWidth / numPoints) * i;
      // Compute y = A*sin(B*x + C) + D.
      let y = riverA * Math.sin(riverB * (x / 50) + riverC) + riverD;
      // Map y to pixel values (invert, then offset).
      y = svgHeight - y * 10; 
      if (i === 0) pathData += `M ${x} ${y} `;
      else pathData += `L ${x} ${y} `;
    }
    return <path d={pathData} stroke="#00ffff" strokeWidth="3" fill="none" />;
  };

  // Reset ecosystem parameters to default.
  const resetParameters = () => {
    setTreeA(0.02);
    setTreeB(0.5);
    setTreeC(1);
    setRiverA(5);
    setRiverB(1);
    setRiverC(0);
    setRiverD(10);
  };

  return (
    <div className="game6-container">
      <header className="game6-header">
        <h1 className="game6-title">Equation Ecosystem</h1>
        <p className="game6-subtitle">
          Grow and balance Numeria's digital ecosystem by tuning algebraic functions!
        </p>
      </header>
      <div className="game6-main">
        {/* Simulation Area */}
        <div className="simulation-area">
          <svg width={svgWidth} height={svgHeight} className="simulation-svg">
            {/* Background Grid (Cartesian Plane) */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,255,255,0.2)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Axes */}
            <line x1="0" y1={svgHeight - 20} x2={svgWidth} y2={svgHeight - 20} stroke="#00ffff" strokeWidth="2" />
            <line x1="30" y1="0" x2="30" y2={svgHeight} stroke="#00ffff" strokeWidth="2" />
            {/* Trees and River */}
            {renderTrees()}
            {renderRiver()}
          </svg>
        </div>
        {/* Control Panel */}
        <div className="control-panel">
          <h2 className="control-title">Control Panel</h2>
          <div className="control-group">
            <h3>Trees</h3>
            <label>
              Vertical Stretch (a):
              <input
                type="range"
                min="0.01"
                max="0.1"
                step="0.005"
                value={treeA}
                onChange={(e) => setTreeA(parseFloat(e.target.value))}
              />
              <span>{treeA.toFixed(3)}</span>
            </label>
            <label>
              Vertical Shift (b):
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={treeB}
                onChange={(e) => setTreeB(parseFloat(e.target.value))}
              />
              <span>{treeB.toFixed(1)}</span>
            </label>
            <label>
              Base Height (c):
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={treeC}
                onChange={(e) => setTreeC(parseFloat(e.target.value))}
              />
              <span>{treeC.toFixed(1)}</span>
            </label>
          </div>
          <div className="control-group">
            <h3>River</h3>
            <label>
              Amplitude (A):
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={riverA}
                onChange={(e) => setRiverA(parseFloat(e.target.value))}
              />
              <span>{riverA}</span>
            </label>
            <label>
              Frequency (B):
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={riverB}
                onChange={(e) => setRiverB(parseFloat(e.target.value))}
              />
              <span>{riverB}</span>
            </label>
            <label>
              Phase Shift (C):
              <input
                type="range"
                min="0"
                max="6.28"
                step="0.1"
                value={riverC}
                onChange={(e) => setRiverC(parseFloat(e.target.value))}
              />
              <span>{riverC.toFixed(1)}</span>
            </label>
            <label>
              Vertical Offset (D):
              <input
                type="range"
                min="5"
                max="20"
                step="1"
                value={riverD}
                onChange={(e) => setRiverD(parseFloat(e.target.value))}
              />
              <span>{riverD}</span>
            </label>
          </div>
          <div className="control-buttons">
            <button className="reset-button" onClick={resetParameters}>
              Reset
            </button>
          </div>
        </div>
      </div>
      <footer className="game6-footer">
        <p>© 2025 Numeria: Equation Ecosystem</p>
      </footer>
    </div>
  );
};

export default Game6;
