import React, { useMemo } from 'react';
import './App.css';
import Banner from './components/Banner.jsx';
import TerminalConsole from './components/TerminalConsole.jsx';
import MetricsGraph from './components/MetricsGraph.jsx';
import CodeEditor from './components/CodeEditor.jsx';
import VictoryScreen from './components/VictoryScreen.jsx';
import useGameState from './hooks/useGameState.js';
import useTerminal from './hooks/useTerminal.js';
import useMetrics from './hooks/useMetrics.js';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function App() {
  const gameState = useGameState();
  const { processCommand } = useTerminal(gameState);
  const metrics = useMetrics(gameState.phase, gameState.PHASES);

  const {
    phase,
    PHASES,
    cluesFound,
    metricsHealth,
    incidentTimer,
    resetGame,
  } = gameState;

  const phaseDisplay = useMemo(() => {
    switch (phase) {
      case PHASES.INVESTIGATING: return 'INVESTIGATING';
      case PHASES.IDENTIFIED: return 'ROOT CAUSE IDENTIFIED';
      case PHASES.EDITING: return 'EDITING CONFIG';
      case PHASES.DEPLOYING: return 'DEPLOYING HOTFIX';
      case PHASES.RESOLVED: return 'RESOLVED';
      default: return phase;
    }
  }, [phase, PHASES]);

  const healthColor = metricsHealth > 70 ? '#4CAF50' : metricsHealth > 40 ? '#FFC107' : '#FF5722';

  return (
    <div className="app-grid font-mono">
      {/* Top Banner */}
      <Banner />

      {/* Title Bar */}
      <div className="title-bar">
        <div className="title-left">
          <span className="red-dot animate-pulse-red" />
          <div>
            <h1>CODE RED</h1>
            <p className="subtitle">Incident Command Center</p>
          </div>
        </div>
        <div className="timer">{formatTime(incidentTimer)}</div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Left: Terminal */}
        <div className="left-pane">
          <TerminalConsole
            gameState={gameState}
            processCommand={processCommand}
          />
        </div>

        {/* Right: Metrics + Editor */}
        <div className="right-pane">
          <div className="right-top">
            <MetricsGraph metrics={metrics} />
          </div>
          <div className="right-bottom">
            <CodeEditor gameState={gameState} />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="phase">
          <span>Phase:</span>
          <span className="phase-label">{phaseDisplay}</span>
        </div>

        <div className="clues">
          <span>Clues:</span>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`clue-dot ${i < cluesFound.length ? 'found' : ''}`}
            />
          ))}
          <span>{cluesFound.length}/3</span>
        </div>

        <div className="health">
          <span>System Health:</span>
          <span className="health-value" style={{ color: healthColor }}>
            {Math.round(metricsHealth)}%
          </span>
        </div>
      </div>

      {/* Victory Overlay */}
      {phase === PHASES.RESOLVED && (
        <VictoryScreen
          gameState={gameState}
          metrics={metrics}
          onRestart={resetGame}
        />
      )}
    </div>
  );
}

export default App;
