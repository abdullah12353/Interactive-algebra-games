// src/components/Game1/Game1.jsx
import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useSpring, animated } from 'react-spring';
import './Game1.css';

const ITEM_TYPE = 'TERM';

// Draggable term component
const Term = ({ termObj }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: termObj,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className="term"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {termObj.term}
    </div>
  );
};

// DropZone component for left/right sides
const DropZone = ({ side, terms, onDropTerm }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item) => onDropTerm(side, item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} className={`drop-zone ${isOver ? 'hovered' : ''}`}>
      {terms.map((term, index) => (
        <div key={index} className="term">{term.term}</div>
      ))}
    </div>
  );
};

// ScaleDisplay component: shows an animated scale that tilts based on tiltAngle.
const ScaleDisplay = ({ tiltAngle }) => {
  const springProps = useSpring({
    transform: `rotate(${tiltAngle}deg)`,
    config: { tension: 200, friction: 15 },
    transformOrigin: '75px 10px',
  });

  return (
    <animated.div className="scale-display" style={springProps}>
      <svg width="150" height="100" viewBox="0 0 150 100">
        {/* Vertical pole */}
        <line x1="75" y1="0" x2="75" y2="60" stroke="black" strokeWidth="4" />
        {/* Beam */}
        <line x1="75" y1="10" x2="40" y2="40" stroke="black" strokeWidth="2" />
        <line x1="75" y1="10" x2="110" y2="40" stroke="black" strokeWidth="2" />
        {/* Pans */}
        <circle cx="40" cy="45" r="10" fill="lightgray" stroke="black" strokeWidth="2" />
        <circle cx="110" cy="45" r="10" fill="lightgray" stroke="black" strokeWidth="2" />
      </svg>
    </animated.div>
  );
};

const Game1 = () => {
  /* 
    We define a target balanced equation for this lesson:
      2x + 4 = x + 5
      
    For a balanced equation, both the sum of coefficients and constants must match.
    When evaluated at x = 1, the left side is 2 + 4 = 6 and the right side is 1 + 5 = 6.
  */
  const initialTerms = [
    { id: 1, term: '2x', coeff: 2, constant: 0 },
    { id: 2, term: '4',  coeff: 0, constant: 4 },
    { id: 3, term: 'x',  coeff: 1, constant: 0 },
    { id: 4, term: '5',  coeff: 0, constant: 5 },
  ];

  // Game state for available terms and terms placed on each side.
  const [availableTerms, setAvailableTerms] = useState(initialTerms);
  const [leftTerms, setLeftTerms] = useState([]);
  const [rightTerms, setRightTerms] = useState([]);
  const [message, setMessage] = useState('');

  // When a term is dropped, remove it from the pool and add it to the designated side.
  const handleDropTerm = (side, termObj) => {
    setAvailableTerms((prev) => prev.filter((term) => term.id !== termObj.id));
    if (side === 'left') {
      setLeftTerms((prev) => [...prev, termObj]);
    } else {
      setRightTerms((prev) => [...prev, termObj]);
    }
  };

  // Compute the sum of coefficients and constants on a side.
  const computeSideSum = (terms) => {
    return terms.reduce(
      (acc, term) => ({
        coeff: acc.coeff + term.coeff,
        constant: acc.constant + term.constant,
      }),
      { coeff: 0, constant: 0 }
    );
  };

  // Check if the left and right sides form a balanced equation.
  const checkBalance = () => {
    const leftSum = computeSideSum(leftTerms);
    const rightSum = computeSideSum(rightTerms);

    if (leftSum.coeff === rightSum.coeff && leftSum.constant === rightSum.constant) {
      setMessage(
        `Balanced! Left: ${leftSum.coeff}x + ${leftSum.constant}, Right: ${rightSum.coeff}x + ${rightSum.constant}`
      );
    } else {
      setMessage(
        `Not balanced. Left: ${leftSum.coeff}x + ${leftSum.constant} vs. Right: ${rightSum.coeff}x + ${rightSum.constant}`
      );
    }
  };

  // Reset game state to initial.
  const resetGame = () => {
    setAvailableTerms(initialTerms);
    setLeftTerms([]);
    setRightTerms([]);
    setMessage('');
  };

  /*
    For a visual tilt, we compute a simple numerical “weight” by evaluating each term at x=1:
    value = coefficient * 1 + constant.
  */
  const leftTotal = leftTerms.reduce((sum, term) => sum + term.coeff + term.constant, 0);
  const rightTotal = rightTerms.reduce((sum, term) => sum + term.coeff + term.constant, 0);
  const tiltAngle = (leftTotal - rightTotal) * 10; // Multiply the difference by 10 for a visible effect

  return (
    <div className="game1-container">
      <h2>Equation Equilibrium</h2>
      <p className="instructions">
        In this game you’ll learn to balance an equation. Each algebraic term is defined by a coefficient (the number in front of x)
        and a constant (a stand-alone number). When evaluated at x = 1, the left and right sides of a balanced equation have equal values.
        For example, our target equation is: 2x + 4 = x + 5.
        Drag the terms from the pool onto the left or right side of the scale to recreate the balanced equation.
      </p>
      
      <div className="game-area">
        {/* Left Side DropZone */}
        <div className="side left">
          <h3>Left Side</h3>
          <DropZone side="left" terms={leftTerms} onDropTerm={handleDropTerm} />
        </div>

        {/* Animated Scale */}
        <div className="center-scale">
          <ScaleDisplay tiltAngle={tiltAngle} />
        </div>

        {/* Right Side DropZone */}
        <div className="side right">
          <h3>Right Side</h3>
          <DropZone side="right" terms={rightTerms} onDropTerm={handleDropTerm} />
        </div>
      </div>

      {/* Controls and feedback */}
      <div className="controls">
        <button onClick={checkBalance}>Check Balance</button>
        <button onClick={resetGame}>Reset</button>
        {message && <p className="feedback">{message}</p>}
      </div>

      {/* Available terms */}
      <div className="available-terms">
        <h3>Available Terms</h3>
        <div className="terms-container">
          {availableTerms.map((term) => (
            <Term key={term.id} termObj={term} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game1;
