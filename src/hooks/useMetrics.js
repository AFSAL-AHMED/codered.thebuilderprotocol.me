import { useState, useEffect, useRef, useCallback } from 'react';

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

function jitter(base, range) {
  return base + (Math.random() - 0.5) * 2 * range;
}

const WINDOW_SIZE = 30;

function pushPoint(arr, val) {
  const next = [...arr, val];
  if (next.length > WINDOW_SIZE) next.shift();
  return next;
}

export default function useMetrics(phase, PHASES) {
  const isResolved = phase === PHASES.RESOLVED || phase === PHASES.DEPLOYING;
  const isDeploying = phase === PHASES.DEPLOYING;

  const [cpu, setCpu] = useState(() => Array(WINDOW_SIZE).fill(94));
  const [errorRate, setErrorRate] = useState(() => Array(WINDOW_SIZE).fill(87));
  const [memory, setMemory] = useState(() => Array(WINDOW_SIZE).fill(78));
  const [responseTime, setResponseTime] = useState(() => Array(WINDOW_SIZE).fill(11000));
  const [activeConns, setActiveConns] = useState(5);

  const tickRef = useRef(0);
  const transitionRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;

      if (isResolved) {
        /* Transition smoothly toward healthy values */
        transitionRef.current = Math.min(transitionRef.current + 0.12, 1);
        const t = transitionRef.current;

        setCpu((prev) => {
          const target = jitter(20, 5);
          const last = prev[prev.length - 1];
          const val = clamp(last + (target - last) * t, 10, 100);
          return pushPoint(prev, val);
        });
        setErrorRate((prev) => {
          const target = jitter(1, 1);
          const last = prev[prev.length - 1];
          const val = clamp(last + (target - last) * t, 0, 100);
          return pushPoint(prev, val);
        });
        setMemory((prev) => {
          const target = jitter(45, 5);
          const last = prev[prev.length - 1];
          const val = clamp(last + (target - last) * t, 10, 100);
          return pushPoint(prev, val);
        });
        setResponseTime((prev) => {
          const target = jitter(80, 35);
          const last = prev[prev.length - 1];
          const val = clamp(last + (target - last) * t, 30, 20000);
          return pushPoint(prev, val);
        });
        setActiveConns(isDeploying ? 5 : 50);
      } else {
        /* Incident mode - alarming values */
        transitionRef.current = 0;

        setCpu((prev) => pushPoint(prev, clamp(jitter(94, 3), 88, 99)));
        setErrorRate((prev) => pushPoint(prev, clamp(jitter(87, 4), 80, 96)));
        setMemory((prev) => {
          const last = prev[prev.length - 1];
          const drift = last + jitter(0.3, 0.5);
          return pushPoint(prev, clamp(drift, 75, 97));
        });
        setResponseTime((prev) => pushPoint(prev, clamp(jitter(11500, 2500), 7000, 16000)));
        setActiveConns(5);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isResolved, isDeploying]);

  const currentCpu = cpu[cpu.length - 1];
  const currentErrorRate = errorRate[errorRate.length - 1];
  const currentMemory = memory[memory.length - 1];
  const currentResponseTime = responseTime[responseTime.length - 1];

  return {
    cpu: { data: cpu, current: currentCpu },
    errorRate: { data: errorRate, current: currentErrorRate },
    memory: { data: memory, current: currentMemory },
    responseTime: { data: responseTime, current: currentResponseTime },
    activeConns,
  };
}
