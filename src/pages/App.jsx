// src/pages/App.jsx
import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Game1 from '../components/Game1/Game1';
import Game2 from '../components/Game2/Game2';
import Game3 from '../components/Game3/Game3';
import Game4 from '../components/Game4/Game4';
import Game5 from '../components/Game5/Game5';
import Game6 from '../components/Game6/Game6';
import '../styles/global.css';

const App = () => {
  const [selectedGame, setSelectedGame] = useState('Game1');

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">Interactive Algebra Mini-Games</h1>
        </header>
        <nav className="app-nav">
          <button
            className={`nav-button ${selectedGame === 'Game1' ? 'active' : ''}`}
            onClick={() => setSelectedGame('Game1')}
          >
            Equation Equilibrium
          </button>
          <button
            className={`nav-button ${selectedGame === 'Game2' ? 'active' : ''}`}
            onClick={() => setSelectedGame('Game2')}
          >
            Expression Alchemist
          </button>
          <button
            className={`nav-button ${selectedGame === 'Game3' ? 'active' : ''}`}
            onClick={() => setSelectedGame('Game3')}
          >
            Function Transformer
          </button>
          <button
            className={`nav-button ${selectedGame === 'Game4' ? 'active' : ''}`}
            onClick={() => setSelectedGame('Game4')}
          >
            Lost Cipher of the Algebromancer
          </button>
          <button
            className={`nav-button ${selectedGame === 'Game5' ? 'active' : ''}`}
            onClick={() => setSelectedGame('Game5')}
          >
            The Labyrinth of Lost Variables
          </button>
          <button
            className={`nav-button ${selectedGame === 'Game6' ? 'active' : ''}`}
            onClick={() => setSelectedGame('Game6')}
          >
            Equation Ecosystem
          </button>
        </nav>
        <main className="app-main">
          {selectedGame === 'Game1' && <Game1 />}
          {selectedGame === 'Game2' && <Game2 />}
          {selectedGame === 'Game3' && <Game3 />}
          {selectedGame === 'Game4' && <Game4 />}
          {selectedGame === 'Game5' && <Game5 />}
          {selectedGame === 'Game6' && <Game6 />}
        </main>
        <footer className="app-footer">
          <p>&copy; 2025 Interactive Algebra Games</p>
        </footer>
      </div>
    </DndProvider>
  );
};

export default App;
