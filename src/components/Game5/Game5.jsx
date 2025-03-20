import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import './Game5.css';

const ITEM_TYPE = 'TILE';

// Tile component – draggable representation of an algebraic term
const Tile = ({ tile, row, col, moveTile }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { ...tile, row, col },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  return (
    <div ref={drag} className="tile" style={{ opacity: isDragging ? 0.5 : 1 }}>
      {tile.term}
    </div>
  );
};

// Cell component – drop target for a tile; if a tile is already here, it may merge or swap.
const Cell = ({ row, col, tile, onDropTile }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item) => onDropTile(item, row, col),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });
  return (
    <div ref={drop} className={`cell ${isOver ? 'cell-hovered' : ''}`}>
      {tile && <Tile tile={tile} row={row} col={col} moveTile={onDropTile} />}
    </div>
  );
};

const GRID_SIZE = 4; // 4x4 grid

// Helper to create an empty grid (2D array)
const createEmptyGrid = () => {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
};

// Our unsimplified expression tiles – example set.
const initialTiles = [
  { id: 1, term: '2x', coefficient: 2, variable: 'x' },
  { id: 2, term: '3x', coefficient: 3, variable: 'x' },
  { id: 3, term: '4',  coefficient: 4, variable: '' },
  { id: 4, term: '-1', coefficient: -1, variable: '' },
  { id: 5, term: '2',  coefficient: 2, variable: '' },
  { id: 6, term: '5y', coefficient: 5, variable: 'y' },
  { id: 7, term: '-3y', coefficient: -3, variable: 'y' },
  { id: 8, term: '7',  coefficient: 7, variable: '' },
];

// Target simplified expression (example): 5x + 2y + 12
const targetExpression = "5x+2y+12";

// Helper: Place the initial tiles randomly on a 4x4 grid.
const initializeGrid = () => {
  let grid = createEmptyGrid();
  const availablePositions = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      availablePositions.push({ r, c });
    }
  }
  // Shuffle positions
  availablePositions.sort(() => Math.random() - 0.5);
  initialTiles.forEach((tile, index) => {
    const pos = availablePositions[index];
    grid[pos.r][pos.c] = { ...tile };
  });
  return grid;
};

// Helper: Compute the overall simplified expression from all tiles on the grid.
const computeSimplifiedExpression = (grid) => {
  const groups = {};
  grid.forEach((row) => {
    row.forEach((tile) => {
      if (tile) {
        const key = tile.variable || 'const';
        if (!groups[key]) groups[key] = 0;
        groups[key] += tile.coefficient;
      }
    });
  });
  // Build the string in sorted order (constants last)
  const terms = [];
  Object.keys(groups)
    .sort((a, b) => {
      if (a === 'const') return 1;
      if (b === 'const') return -1;
      return a.localeCompare(b);
    })
    .forEach((key) => {
      const coeff = groups[key];
      if (coeff !== 0) {
        if (key === 'const') {
          terms.push(`${coeff}`);
        } else {
          if (coeff === 1) terms.push(`${key}`);
          else if (coeff === -1) terms.push(`-${key}`);
          else terms.push(`${coeff}${key}`);
        }
      }
    });
  return terms.join("+").replace(/\+\-/g, "-");
};

const Game5 = () => {
  const [grid, setGrid] = useState(initializeGrid());
  const [message, setMessage] = useState('');
  const [undoStack, setUndoStack] = useState([]);

  // Save the current grid state for undo.
  const saveState = () => {
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(grid))]);
  };

  // Handle tile drop: item dragged from (srcRow, srcCol) dropped on (targetRow, targetCol)
  const handleDropTile = (item, targetRow, targetCol) => {
    saveState();
    setGrid((prevGrid) => {
      const newGrid = JSON.parse(JSON.stringify(prevGrid));
      const srcRow = item.row;
      const srcCol = item.col;
      const srcTile = newGrid[srcRow][srcCol];
      const targetTile = newGrid[targetRow][targetCol];
      // If target cell is empty, move the tile there.
      if (!targetTile) {
        newGrid[targetRow][targetCol] = srcTile;
        newGrid[srcRow][srcCol] = null;
      } else {
        // If both tiles are like terms (same variable), merge them.
        if (srcTile.variable === targetTile.variable) {
          const mergedCoeff = targetTile.coefficient + srcTile.coefficient;
          // Create new merged tile.
          const mergedTile = {
            ...targetTile,
            coefficient: mergedCoeff,
            term: (mergedCoeff === 1 && targetTile.variable ? targetTile.variable :
                   mergedCoeff === -1 && targetTile.variable ? `-${targetTile.variable}` :
                   `${mergedCoeff}${targetTile.variable}`)
          };
          newGrid[targetRow][targetCol] = mergedTile;
          newGrid[srcRow][srcCol] = null;
        } else {
          // Otherwise, swap the two tiles.
          newGrid[targetRow][targetCol] = srcTile;
          newGrid[srcRow][srcCol] = targetTile;
        }
      }
      return newGrid;
    });
  };

  // Undo the last move
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setGrid(previousState);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
  };

  // Check if the grid's simplified expression matches the target.
  const checkExpression = () => {
    const result = computeSimplifiedExpression(grid);
    if (result === targetExpression) {
      setMessage("Rune Activated! You've restored algebraic harmony!");
    } else {
      setMessage(`Current Expression: ${result} — Keep rearranging!`);
    }
  };

  // Hint: Suggest merging tiles if any adjacent like terms are found.
  const getHint = () => {
    // For simplicity, check if any two tiles in the grid share the same variable and are not merged.
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tile = grid[r][c];
        if (tile) {
          // Check neighbors (up, down, left, right)
          const directions = [
            { dr: -1, dc: 0 },
            { dr: 1, dc: 0 },
            { dr: 0, dc: -1 },
            { dr: 0, dc: 1 },
          ];
          for (const { dr, dc } of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
              const neighbor = grid[nr][nc];
              if (neighbor && neighbor.variable === tile.variable) {
                return `Try merging the ${tile.term} with ${neighbor.term}.`;
              }
            }
          }
        }
      }
    }
    return "Look for opportunities to merge like terms.";
  };

  return (
    <div className="game5-container">
      <header className="game5-header">
        <h1 className="game5-title">The Labyrinth of Lost Variables</h1>
        <p className="game5-subtitle">
          Slide, combine, and rearrange the mystical tiles to reconstruct the correct expression and restore harmony!
        </p>
      </header>
      <div className="game5-main">
        <div className="grid-container">
          {grid.map((row, rIndex) => (
            <div key={rIndex} className="grid-row">
              {row.map((cell, cIndex) => (
                <Cell
                  key={`${rIndex}-${cIndex}`}
                  row={rIndex}
                  col={cIndex}
                  tile={cell}
                  onDropTile={handleDropTile}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="game5-sidebar">
          <button className="sidebar-button" onClick={handleUndo}>Undo Rune</button>
          <button className="sidebar-button" onClick={checkExpression}>Check Expression</button>
          <button className="sidebar-button" onClick={() => {
            setGrid(initializeGrid());
            setUndoStack([]);
            setMessage('');
          }}>New Puzzle</button>
          <div className="hint-box">{getHint()}</div>
          <div className="expression-display">
            <h3>Simplified Expression:</h3>
            <p>{computeSimplifiedExpression(grid)}</p>
          </div>
          <div className="target-display">
            <h3>Target Expression:</h3>
            <p>{targetExpression}</p>
          </div>
          {message && <div className="message">{message}</div>}
        </div>
      </div>
      <footer className="game5-footer">
        <p>© 2025 Numeria, The Realm of Algebra</p>
      </footer>
    </div>
  );
};

export default Game5;
