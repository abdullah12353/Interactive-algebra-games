import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useSpring, animated } from 'react-spring';
import './Game2.css';

const ITEM_TYPE = 'INGREDIENT';

// Draggable ingredient component (each algebraic term)
const DraggableIngredient = ({ ingredient }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: ingredient,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className="ingredient"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {ingredient.term}
    </div>
  );
};

// Cauldron drop zone: where ingredients are dropped into the magical cauldron.
const CauldronDropZone = ({ onDropIngredient, children }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item) => onDropIngredient(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} className={`cauldron-dropzone ${isOver ? 'hovered' : ''}`}>
      {children}
    </div>
  );
};

const Game2 = () => {
  // The target expression is 5x + 1
  const targetExpression = { coeff: 5, constant: 1 };

  /* 
    We start with an unsimplified expression:
      2x + 6 + 3x - 5
    Available ingredients include the necessary terms as well as decoys.
  */
  const initialIngredients = [
    { id: 1, term: '2x', coefficient: 2, variable: 'x' },
    { id: 2, term: '6', coefficient: 6, variable: '' },
    { id: 3, term: '3x', coefficient: 3, variable: 'x' },
    { id: 4, term: '-5', coefficient: -5, variable: '' },
    // Decoy ingredients
    { id: 5, term: 'x', coefficient: 1, variable: 'x' },
    { id: 6, term: '-2', coefficient: -2, variable: '' }
  ];

  const [availableIngredients, setAvailableIngredients] = useState(initialIngredients);
  const [cauldronIngredients, setCauldronIngredients] = useState([]);
  const [message, setMessage] = useState('');

  // When a player drops an ingredient, remove it from the pool and add it to the cauldron.
  const handleDropIngredient = (ingredient) => {
    setAvailableIngredients((prev) =>
      prev.filter((item) => item.id !== ingredient.id)
    );
    setCauldronIngredients((prev) => [...prev, ingredient]);
  };

  // Simplify the expression by grouping like terms.
  const simplifyExpression = (ingredients) => {
    let groups = {};
    ingredients.forEach((ing) => {
      let key = ing.variable || 'const';
      if (!groups[key]) groups[key] = 0;
      groups[key] += ing.coefficient;
    });
    let result = [];
    Object.entries(groups).forEach(([key, sum]) => {
      if (sum !== 0) {
        if (key === 'const') {
          result.push({ term: sum.toString(), coefficient: sum, variable: '' });
        } else {
          result.push({ term: sum + key, coefficient: sum, variable: key });
        }
      }
    });
    return result;
  };

  const simplifiedExpression = simplifyExpression(cauldronIngredients);

  // Animate the simplified expression display.
  const expressionAnimation = useSpring({
    opacity: simplifiedExpression.length > 0 ? 1 : 0,
    transform: simplifiedExpression.length > 0 ? 'scale(1)' : 'scale(0.8)',
    config: { tension: 200, friction: 12 },
    reset: true,
  });

  // Check if the simplified expression matches the target.
  const checkSpell = () => {
    const sums = cauldronIngredients.reduce(
      (acc, ing) => {
        if (ing.variable === 'x') {
          acc.coeff += ing.coefficient;
        } else {
          acc.constant += ing.coefficient;
        }
        return acc;
      },
      { coeff: 0, constant: 0 }
    );

    if (sums.coeff === targetExpression.coeff && sums.constant === targetExpression.constant) {
      setMessage('Spell Cast! You simplified correctly to 5x + 1!');
    } else {
      setMessage(
        `Not quite right. Your expression simplifies to ${
          sums.coeff ? sums.coeff + 'x' : ''
        } ${sums.constant >= 0 ? '+' : '-'} ${Math.abs(sums.constant)}. Try again!`
      );
    }
  };

  // Reset the game to its initial state.
  const resetGame = () => {
    setAvailableIngredients(initialIngredients);
    setCauldronIngredients([]);
    setMessage('');
  };

  return (
    <div className="game2-container">
      <h2>Expression Alchemist</h2>
      <p className="instructions">
        Your goal is to simplify the expression <strong>2x + 6 + 3x - 5</strong> into its simplest form.
        <br />
        Combine the correct ingredients to achieve the target: <strong>5x + 1</strong>.
        <br />
        Beware of decoy ingredients that might lead you astray!
      </p>
      
      <div className="game2-area">
        {/* Ingredients Pool */}
        <div className="ingredients-pool">
          <h3>Available Ingredients</h3>
          <div className="ingredients-container">
            {availableIngredients.map((ing) => (
              <DraggableIngredient key={ing.id} ingredient={ing} />
            ))}
          </div>
        </div>

        {/* Cauldron Section */}
        <div className="cauldron-section">
          <h3>Magical Cauldron</h3>
          <CauldronDropZone onDropIngredient={handleDropIngredient}>
            <div className="cauldron-visual">
              <img src="/cauldron.png" alt="Cauldron" />
              <animated.div style={expressionAnimation} className="simplified-expression">
                {simplifiedExpression.length > 0
                  ? simplifiedExpression.map((term, idx) => (
                      <span key={idx}>{term.term} </span>
                    ))
                  : <span>?</span>}
              </animated.div>
            </div>
          </CauldronDropZone>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <button onClick={checkSpell}>Check Spell</button>
        <button onClick={resetGame}>Reset</button>
      </div>
      {message && <p className="feedback">{message}</p>}

      {/* Spellbook: In-game reference guide */}
      <div className="spellbook">
        <h4>Alchemy Spellbook</h4>
        <p>
          <strong>Fusion Reaction:</strong> Combine like terms to fuse them into a single term. <br />
          <strong>Cancellation Reaction:</strong> Opposite terms cancel out each other.
        </p>
      </div>
    </div>
  );
};

export default Game2;
