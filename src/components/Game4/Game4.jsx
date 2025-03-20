import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import expressionBank from '../../utils/expressionBank';
import './Game4.css';

const ITEM_TYPE = 'TERM';

// Helper: Parse an unsimplified expression string into term objects.
const parseExpression = (expr) => {
  // Replace "-" with " + -" to standardize splitting.
  const standardized = expr.replace(/\s*\-\s*/g, ' + -');
  const parts = standardized.split('+').map((s) => s.trim()).filter((s) => s !== '');
  let idCounter = 1;
  return parts.map((termStr) => {
    // Regex to capture an optional coefficient and variable.
    const regex = /^(-?\d*\.?\d+)?([a-zA-Z]+)?$/;
    const match = termStr.match(regex);
    let coefficient = 0;
    let variable = '';
    if (match) {
      // If no number is provided, assume 1 (or -1 if termStr starts with "-")
      if (match[1] === '' || match[1] === undefined) {
        coefficient = match[2] ? (termStr.startsWith('-') ? -1 : 1) : 0;
      } else {
        coefficient = parseFloat(match[1]);
      }
      variable = match[2] || '';
    } else {
      coefficient = parseFloat(termStr);
    }
    return { id: idCounter++, term: termStr, coefficient, variable };
  });
};

// Draggable term component
const DraggableTerm = ({ termObj }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: termObj,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  return (
    <div ref={drag} className="draggable-term" style={{ opacity: isDragging ? 0.5 : 1 }}>
      {termObj.term}
    </div>
  );
};

// Drop zone component for grouping terms
const DropZone = ({ onDropTerm, children }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item) => onDropTerm(item),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });
  return (
    <div ref={drop} className={`drop-zone ${isOver ? 'hovered' : ''}`}>
      {children}
    </div>
  );
};

const Game4 = () => {
  // Select a random expression from the bank on first render.
  const [currentExpression, setCurrentExpression] = useState(null);
  const [availableTerms, setAvailableTerms] = useState([]);
  const [groupedTerms, setGroupedTerms] = useState([]);
  const [message, setMessage] = useState('');
  const [undoStack, setUndoStack] = useState([]);

  // Load a new expression from the bank
  const loadNewExpression = () => {
    const randomExpr = expressionBank[Math.floor(Math.random() * expressionBank.length)];
    setCurrentExpression(randomExpr);
    setAvailableTerms(parseExpression(randomExpr.unsimplified));
    setGroupedTerms([]);
    setMessage('');
    setUndoStack([]);
  };

  // On mount, load an expression.
  useEffect(() => {
    loadNewExpression();
  }, []);

  // Handle drop: Remove term from pool and group with like terms.
  const handleDropTerm = (item) => {
    // Save current state for undo.
    setUndoStack((prev) => [
      ...prev,
      { availableTerms: [...availableTerms], groupedTerms: [...groupedTerms] },
    ]);
    setAvailableTerms((prev) => prev.filter((term) => term.id !== item.id));
    const existingIndex = groupedTerms.findIndex((term) => term.variable === item.variable);
    if (existingIndex !== -1) {
      const updatedTerm = {
        ...groupedTerms[existingIndex],
        coefficient: groupedTerms[existingIndex].coefficient + item.coefficient,
      };
      const newGrouped = [...groupedTerms];
      newGrouped[existingIndex] = updatedTerm;
      setGroupedTerms(newGrouped);
    } else {
      setGroupedTerms((prev) => [...prev, { ...item }]);
    }
  };

  // Undo last move.
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastState = undoStack[undoStack.length - 1];
    setAvailableTerms(lastState.availableTerms);
    setGroupedTerms(lastState.groupedTerms);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
  };

  // Build a normalized string from grouped terms.
  const buildSimplifiedString = () => {
    if (groupedTerms.length === 0) return "";
    const sorted = groupedTerms.sort((a, b) => a.variable.localeCompare(b.variable));
    return sorted
      .map((term) => {
        const coeff = term.coefficient;
        const variable = term.variable;
        if (variable) {
          if (coeff === 1) return `${variable}`;
          if (coeff === -1) return `-${variable}`;
          return `${coeff}${variable}`;
        } else {
          return `${coeff}`;
        }
      })
      .join(" + ")
      .replace(/\+\s-\s/g, "- ");
  };

  // Normalize an expression string (remove whitespace)
  const normalize = (str) => str.replace(/\s+/g, '');

  // Check if the player's grouped terms match the target simplified expression.
  const checkSolution = () => {
    if (!currentExpression) return;
    const playerResult = normalize(buildSimplifiedString());
    const targetResult = normalize(currentExpression.simplified);
    if (playerResult === targetResult) {
      setMessage("Spell Restored! You've decoded the lost cipher!");
    } else {
      setMessage("The spell remains unstable. Keep simplifying!");
    }
  };

  return (
    <div className="game4-container">
      <header className="game4-header">
        <h1 className="game4-title">The Lost Cipher of the Algebromancer</h1>
        <p className="game4-subtitle">
          Restore the ancient spell by decoding and simplifying the chaotic expression!
        </p>
      </header>
      <div className="game4-main">
        <div className="expression-plate">
          <h2>Magical Parchment</h2>
          {currentExpression && (
            <p className="unsimplified-expression">
              {currentExpression.unsimplified}
            </p>
          )}
          <div className="terms-pool">
            {availableTerms.map((term) => (
              <DraggableTerm key={term.id} termObj={term} />
            ))}
          </div>
        </div>
        <div className="simplification-zone">
          <h2>Simplification Cauldron</h2>
          <DropZone onDropTerm={handleDropTerm}>
            <div className="grouped-terms">
              {groupedTerms.map((term, idx) => (
                <div key={idx} className="grouped-term">
                  {term.coefficient}
                  {term.variable}
                </div>
              ))}
            </div>
          </DropZone>
          <div className="controls">
            <button className="control-button" onClick={handleUndo}>
              Undo
            </button>
            <button className="control-button" onClick={checkSolution}>
              Check Spell
            </button>
            <button className="control-button" onClick={loadNewExpression}>
              New Expression
            </button>
          </div>
          <div className="simplified-expression-display">
            <h3>Simplified Expression:</h3>
            <p>{buildSimplifiedString()}</p>
          </div>
          {message && <div className="message">{message}</div>}
        </div>
      </div>
      <footer className="game4-footer">
        <p>© 2025 Numeria, The Realm of Algebra</p>
      </footer>
    </div>
  );
};

export default Game4;
