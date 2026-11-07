import React, { useState, useRef, useEffect, useCallback } from 'react';
import { welcomeMessages } from '../data/logMessages.js';

export default function TerminalConsole({ gameState, processCommand }) {
  const [input, setInput] = useState('');
  const [displayedEntries, setDisplayedEntries] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const outputRef = useRef(null);
  const inputRef = useRef(null);
  const prevHistoryLen = useRef(0);
  const hasWelcomed = useRef(false);

  /* Show welcome message on first render */
  useEffect(() => {
    if (!hasWelcomed.current) {
      hasWelcomed.current = true;
      setDisplayedEntries([{ type: 'output', lines: welcomeMessages, id: 'welcome' }]);
    }
  }, []);

  /* When terminalHistory updates, animate new entries */
  useEffect(() => {
    const history = gameState.terminalHistory;
    if (history.length <= prevHistoryLen.current) {
      /* Terminal was cleared */
      if (history.length === 0) {
        setDisplayedEntries([]);
        prevHistoryLen.current = 0;
      }
      return;
    }

    const newEntries = history.slice(prevHistoryLen.current);
    prevHistoryLen.current = history.length;

    /* Typing animation: add lines one by one */
    let delay = 0;
    const LINE_DELAY = 40;

    newEntries.forEach((entry) => {
      const entryId = `${Date.now()}-${Math.random()}`;

      if (entry.type === 'command') {
        delay += 50;
        setTimeout(() => {
          setDisplayedEntries((prev) => [...prev, { ...entry, id: entryId }]);
        }, delay);
      } else if (entry.lines) {
        entry.lines.forEach((line, i) => {
          delay += LINE_DELAY;
          setTimeout(() => {
            setDisplayedEntries((prev) => {
              const existing = prev.find((e) => e.id === entryId);
              if (existing) {
                return prev.map((e) =>
                  e.id === entryId
                    ? { ...e, lines: [...e.lines, line], logEntry: entry.logEntries ? entry.logEntries[i] : null }
                    : e,
                );
              }
              return [
                ...prev,
                {
                  ...entry,
                  lines: [line],
                  id: entryId,
                  logEntry: entry.logEntries ? entry.logEntries[i] : null,
                },
              ];
            });
          }, delay);
        });
      } else {
        delay += 80;
        setTimeout(() => {
          setDisplayedEntries((prev) => [...prev, { ...entry, id: entryId }]);
        }, delay);
      }
    });

    /* Show system alert when 3 clues found */
    if (gameState.cluesFound.length >= 3 && gameState.phase === 'IDENTIFIED') {
      delay += 200;
      setTimeout(() => {
        setDisplayedEntries((prev) => [
          ...prev,
          {
            type: 'alert',
            text: '⚡ ROOT CAUSE IDENTIFIED: Connection pool bottleneck detected. Configuration file unlocked for emergency hotfix.',
            id: `alert-${Date.now()}`,
          },
        ]);
      }, delay);
    }
  }, [gameState.terminalHistory, gameState.cluesFound.length, gameState.phase]);

  /* Auto-scroll to bottom */
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [displayedEntries]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!input.trim()) return;
      processCommand(input);
      setInput('');
    },
    [input, processCommand],
  );

  /* Focus terminal on click */
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  function renderLine(line, entry, idx) {
    if (!line) return null;

    /* Color-coded log levels */
    if (line.includes('ERROR') || line.includes('FATAL')) {
      return <span className="text-cr-orange">{line}</span>;
    }
    if (line.includes('WARN')) {
      return <span className="text-cr-warn">{line}</span>;
    }
    if (line.includes('INFO')) {
      return <span className="text-cr-cyan">{line}</span>;
    }
    if (line.includes('CRITICAL') || line.includes('DANGER') || line.includes('ALERT')) {
      return <span className="text-cr-orange">{line}</span>;
    }
    if (line.includes('WARNING') || line.includes('⚠')) {
      return <span className="text-cr-warn">{line}</span>;
    }

    return <span className="text-gray-300">{line}</span>;
  }

  return (
    <div className="flex flex-col h-full bg-cr-terminal relative overflow-hidden">
      {/* Scan line overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-[0.03]">
        <div
          className="w-full h-[2px] bg-white animate-scan-line"
          style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-cr-slate border-b-2 border-cr-slate select-none shrink-0">
        <span className="w-2 h-2 rounded-full bg-cr-orange animate-pulse-red inline-block" />
        <span className="text-white font-bold text-xs uppercase tracking-widest">Terminal</span>
        <span className="text-gray-500 text-xs ml-auto uppercase">live</span>
      </div>

      {/* Output area */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed custom-scrollbar cursor-text"
        onClick={focusInput}
      >
        {displayedEntries.map((entry) => (
          <div key={entry.id} className="mb-1 animate-slide-up">
            {entry.type === 'command' && (
              <div className="flex">
                <span className="text-cr-green mr-2 shrink-0 select-none">incident-cmd@prod-cluster $</span>
                <span className="text-white">{entry.text}</span>
              </div>
            )}

            {(entry.type === 'output' || entry.type === 'log' || entry.type === 'config') &&
              entry.lines &&
              entry.lines.map((line, i) => (
                <div key={i} className="whitespace-pre font-mono text-sm">
                  {renderLine(line, entry, i)}
                </div>
              ))}

            {entry.type === 'system' && (
              <div className="text-cr-cyan font-bold py-1 border-l-2 border-cr-cyan pl-3 my-2">
                {entry.text}
              </div>
            )}

            {entry.type === 'alert' && (
              <div className="text-cr-orange font-bold py-2 px-3 my-2 border-2 border-cr-orange bg-cr-orange/10 animate-pulse-red">
                {entry.text}
              </div>
            )}

            {entry.type === 'error' && (
              <div className="text-red-400 py-1">{entry.text}</div>
            )}
          </div>
        ))}
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center px-4 py-3 border-t border-gray-800 bg-cr-terminal shrink-0"
      >
        <span className="text-cr-green mr-2 shrink-0 text-sm select-none">incident-cmd@prod-cluster $</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent text-white outline-none font-mono text-sm caret-cr-green"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          aria-label="Terminal command input"
        />
        <span className="w-2 h-5 bg-cr-green animate-blink ml-0.5 shrink-0" />
      </form>
    </div>
  );
}
