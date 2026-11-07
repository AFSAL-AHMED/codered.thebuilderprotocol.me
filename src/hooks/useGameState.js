import { useState, useCallback, useRef, useEffect } from 'react';

const PHASES = {
  INVESTIGATING: 'INVESTIGATING',
  IDENTIFIED: 'IDENTIFIED',
  EDITING: 'EDITING',
  DEPLOYING: 'DEPLOYING',
  RESOLVED: 'RESOLVED',
};

export default function useGameState() {
  const [phase, setPhase] = useState(PHASES.INVESTIGATING);
  const [cluesFound, setCluesFound] = useState([]);
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [metricsHealth, setMetricsHealth] = useState(15);
  const [errorRate, setErrorRate] = useState(87);
  const [connectionPoolSize, setConnectionPoolSize] = useState(5);
  const [gatewayTimeout, setGatewayTimeout] = useState(3000);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [incidentTimer, setIncidentTimer] = useState(0);
  const [commandCount, setCommandCount] = useState(0);
  const timerRef = useRef(null);

  /* Incident timer - counts up every second */
  useEffect(() => {
    if (phase === PHASES.RESOLVED) return;
    timerRef.current = setInterval(() => {
      setIncidentTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const addClue = useCallback(
    (clueId) => {
      setCluesFound((prev) => {
        if (prev.includes(clueId)) return prev;
        const next = [...prev, clueId];
        if (next.length >= 3) {
          setPhase(PHASES.IDENTIFIED);
        }
        return next;
      });
    },
    [],
  );

  const incrementCommandCount = useCallback(() => {
    setCommandCount((prev) => prev + 1);
  }, []);

  const addTerminalEntry = useCallback((entry) => {
    setTerminalHistory((prev) => [...prev, entry]);
  }, []);

  const clearTerminal = useCallback(() => {
    setTerminalHistory([]);
  }, []);

  const updatePoolSize = useCallback((value) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      setConnectionPoolSize(num);
      if (phase === PHASES.IDENTIFIED) setPhase(PHASES.EDITING);
    }
  }, [phase]);

  const updateGatewayTimeout = useCallback((value) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      setGatewayTimeout(num);
      if (phase === PHASES.IDENTIFIED) setPhase(PHASES.EDITING);
    }
  }, [phase]);

  const startDeployment = useCallback(() => {
    setPhase(PHASES.DEPLOYING);
    setDeploymentProgress(0);

    const steps = [
      { progress: 5, delay: 200 },
      { progress: 15, delay: 400 },
      { progress: 25, delay: 500 },
      { progress: 40, delay: 500 },
      { progress: 55, delay: 400 },
      { progress: 65, delay: 500 },
      { progress: 75, delay: 400 },
      { progress: 85, delay: 400 },
      { progress: 92, delay: 300 },
      { progress: 100, delay: 300 },
    ];

    let elapsed = 0;
    steps.forEach(({ progress, delay }) => {
      elapsed += delay;
      setTimeout(() => {
        setDeploymentProgress(progress);
        if (progress === 100) {
          setTimeout(() => {
            setPhase(PHASES.RESOLVED);
            setMetricsHealth(100);
            setErrorRate(0);
          }, 500);
        }
      }, elapsed);
    });
  }, []);

  const resetGame = useCallback(() => {
    setPhase(PHASES.INVESTIGATING);
    setCluesFound([]);
    setTerminalHistory([]);
    setMetricsHealth(15);
    setErrorRate(87);
    setConnectionPoolSize(5);
    setGatewayTimeout(3000);
    setDeploymentProgress(0);
    setIncidentTimer(0);
    setCommandCount(0);
  }, []);

  return {
    /* state */
    phase,
    cluesFound,
    terminalHistory,
    metricsHealth,
    errorRate,
    connectionPoolSize,
    gatewayTimeout,
    deploymentProgress,
    incidentTimer,
    commandCount,
    PHASES,

    /* actions */
    setPhase,
    addClue,
    addTerminalEntry,
    clearTerminal,
    updatePoolSize,
    updateGatewayTimeout,
    startDeployment,
    resetGame,
    incrementCommandCount,
    setMetricsHealth,
    setErrorRate,
  };
}
