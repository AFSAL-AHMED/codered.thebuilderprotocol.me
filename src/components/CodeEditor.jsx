import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { brokenConfig, validationRules } from '../data/serverConfig.js';
import { deploymentMessages } from '../data/logMessages.js';

/* Basic syntax highlighting for the config code */
function highlightSyntax(code) {
  const lines = code.split('\n');
  return lines.map((line, i) => {
    let segments = [];

    /* Comments */
    const commentIdx = line.indexOf('//');
    let codePart = line;
    let commentPart = '';
    if (commentIdx !== -1) {
      codePart = line.substring(0, commentIdx);
      commentPart = line.substring(commentIdx);
    }

    /* Process code part - tokenize */
    let remaining = codePart;
    let key = 0;

    /* Keywords */
    const keywords = ['const', 'require', 'module', 'exports', 'process', 'env', 'true', 'false'];
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');

    /* Strings */
    const stringRegex = /('[^']*'|"[^"]*")/g;

    /* Numbers */
    const numberRegex = /\b(\d+)\b/g;

    /* Combined tokenization */
    const tokens = [];
    let match;

    /* Find all token positions */
    const allMatches = [];

    const kwRe = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    while ((match = kwRe.exec(remaining)) !== null) {
      allMatches.push({ start: match.index, end: match.index + match[0].length, type: 'keyword', text: match[0] });
    }

    const strRe = /('[^']*'|"[^"]*")/g;
    while ((match = strRe.exec(remaining)) !== null) {
      allMatches.push({ start: match.index, end: match.index + match[0].length, type: 'string', text: match[0] });
    }

    const numRe = /\b(\d+)\b/g;
    while ((match = numRe.exec(remaining)) !== null) {
      /* Skip if inside a string match */
      const inString = allMatches.some(
        (m) => m.type === 'string' && match.index >= m.start && match.index < m.end,
      );
      if (!inString) {
        allMatches.push({ start: match.index, end: match.index + match[0].length, type: 'number', text: match[0] });
      }
    }

    /* Sort by position */
    allMatches.sort((a, b) => a.start - b.start);

    /* Build segments */
    let pos = 0;
    allMatches.forEach((m) => {
      if (m.start > pos) {
        segments.push(
          <span key={`plain-${i}-${pos}`} className="text-gray-300">
            {remaining.substring(pos, m.start)}
          </span>,
        );
      }
      if (m.start >= pos) {
        const colorClass =
          m.type === 'keyword'
            ? 'text-cr-cyan'
            : m.type === 'string'
            ? 'text-cr-orange'
            : 'text-white';
        segments.push(
          <span key={`${m.type}-${i}-${m.start}`} className={colorClass}>
            {m.text}
          </span>,
        );
        pos = m.end;
      }
    });

    if (pos < remaining.length) {
      segments.push(
        <span key={`end-${i}`} className="text-gray-300">
          {remaining.substring(pos)}
        </span>,
      );
    }

    /* Add comment */
    if (commentPart) {
      segments.push(
        <span key={`comment-${i}`} className="text-gray-500 italic">
          {commentPart}
        </span>,
      );
    }

    return { lineNum: i + 1, segments };
  });
}

export default function CodeEditor({ gameState }) {
  const {
    phase,
    PHASES,
    connectionPoolSize,
    gatewayTimeout,
    updatePoolSize,
    updateGatewayTimeout,
    startDeployment,
    deploymentProgress,
  } = gameState;

  const isLocked = phase === PHASES.INVESTIGATING;
  const isDeploying = phase === PHASES.DEPLOYING;
  const isResolved = phase === PHASES.RESOLVED;
  const canEdit = phase === PHASES.IDENTIFIED || phase === PHASES.EDITING;

  const [poolInput, setPoolInput] = useState('5');
  const [timeoutInput, setTimeoutInput] = useState('3000');
  const [editingPool, setEditingPool] = useState(false);
  const [editingTimeout, setEditingTimeout] = useState(false);

  const poolValid = connectionPoolSize >= validationRules.poolMax.min;
  const timeoutValid = gatewayTimeout >= validationRules.gatewayTimeout.min;
  const canDeploy = poolValid && timeoutValid && canEdit;

  /* Parse and highlight the config */
  const highlightedLines = useMemo(() => highlightSyntax(brokenConfig), []);

  const handlePoolChange = useCallback(
    (e) => {
      setPoolInput(e.target.value);
      updatePoolSize(e.target.value);
    },
    [updatePoolSize],
  );

  const handleTimeoutChange = useCallback(
    (e) => {
      setTimeoutInput(e.target.value);
      updateGatewayTimeout(e.target.value);
    },
    [updateGatewayTimeout],
  );

  /* Find the deployment status message for current progress */
  const deployMessage = useMemo(() => {
    if (!isDeploying) return null;
    const msgs = deploymentMessages.filter((m) => m.progress <= deploymentProgress);
    return msgs.length > 0 ? msgs[msgs.length - 1].msg : 'Initializing deployment...';
  }, [isDeploying, deploymentProgress]);

  /* Line numbers where editable values appear */
  const POOL_LINE = 23; /* max: 5 */
  const TIMEOUT_LINE = 31; /* timeout: 3000 */

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-cr-slate border-b-2 border-cr-slate select-none shrink-0">
        <span className="text-base">{isLocked ? '🔒' : '🔓'}</span>
        <span className="text-white font-bold text-xs uppercase tracking-widest">Config Editor</span>
        <span className="text-gray-500 text-xs ml-auto uppercase">
          {isLocked ? 'locked' : isDeploying ? 'deploying' : 'editable'}
        </span>
      </div>

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-20 bg-cr-bg/90 flex items-center justify-center top-[40px]">
          <div className="text-center px-6">
            <div className="text-4xl mb-3">🔒</div>
            <div className="text-cr-slate font-extrabold text-sm uppercase tracking-widest">
              Investigate the incident to unlock
            </div>
            <div className="text-gray-500 text-xs mt-2">Find 3 clues using the terminal</div>
          </div>
        </div>
      )}

      {/* Code area */}
      <div className="flex-1 bg-cr-terminal overflow-auto custom-scrollbar">
        <div className="flex text-sm leading-6 p-0">
          {/* Line numbers */}
          <div className="select-none text-gray-600 text-right pr-3 pl-3 py-3 border-r border-gray-800 shrink-0 bg-[#0a0a0a]">
            {highlightedLines.map(({ lineNum }) => (
              <div key={lineNum} className="h-6 flex items-center justify-end">
                {lineNum}
              </div>
            ))}
          </div>

          {/* Code content */}
          <div className="flex-1 py-3 pl-4 pr-3 overflow-x-auto">
            {highlightedLines.map(({ lineNum, segments }) => {
              const isPoolLine = lineNum === POOL_LINE;
              const isTimeoutLine = lineNum === TIMEOUT_LINE;
              const isEditableLine = isPoolLine || isTimeoutLine;

              return (
                <div
                  key={lineNum}
                  className={`h-6 flex items-center whitespace-pre ${
                    isEditableLine && canEdit ? 'bg-cr-orange/10 border-l-2 border-cr-orange' : ''
                  } ${isEditableLine && canEdit ? 'animate-pulse-red' : ''}`}
                >
                  {isPoolLine && canEdit ? (
                    <span className="text-gray-300">
                      {'      max: '}
                      <input
                        type="text"
                        value={poolInput}
                        onChange={handlePoolChange}
                        onFocus={() => setEditingPool(true)}
                        onBlur={() => setEditingPool(false)}
                        className={`w-16 bg-transparent border-b-2 outline-none text-center font-mono text-sm font-bold ${
                          poolValid ? 'border-cr-green text-cr-green' : 'border-cr-orange text-cr-orange'
                        }`}
                        disabled={isDeploying || isResolved}
                      />
                      <span className="text-gray-500 italic">
                        {poolValid
                          ? '          // ✓ Pool size adequate'
                          : `          // ← CRITICAL: Increase to ${validationRules.poolMax.recommended}+`}
                      </span>
                    </span>
                  ) : isTimeoutLine && canEdit ? (
                    <span className="text-gray-300">
                      {'      timeout: '}
                      <input
                        type="text"
                        value={timeoutInput}
                        onChange={handleTimeoutChange}
                        onFocus={() => setEditingTimeout(true)}
                        onBlur={() => setEditingTimeout(false)}
                        className={`w-20 bg-transparent border-b-2 outline-none text-center font-mono text-sm font-bold ${
                          timeoutValid ? 'border-cr-green text-cr-green' : 'border-cr-orange text-cr-orange'
                        }`}
                        disabled={isDeploying || isResolved}
                      />
                      <span className="text-gray-500 italic">
                        {timeoutValid
                          ? '   // ✓ Gateway timeout adequate'
                          : `   // ← CRITICAL: Increase to ${validationRules.gatewayTimeout.recommended}+`}
                      </span>
                    </span>
                  ) : (
                    segments
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Validation + Deploy area */}
      <div className="bg-cr-bg border-t-2 border-cr-slate p-3 shrink-0">
        {/* Validation status */}
        {canEdit && (
          <div className="flex flex-col gap-1 mb-3 text-xs font-bold uppercase tracking-wider">
            <div className={poolValid ? 'text-cr-green' : 'text-cr-orange'}>
              {poolValid
                ? `✓ Pool size adequate (${connectionPoolSize})`
                : `✗ Pool size too low (min: ${validationRules.poolMax.min})`}
            </div>
            <div className={timeoutValid ? 'text-cr-green' : 'text-cr-orange'}>
              {timeoutValid
                ? `✓ Gateway timeout adequate (${gatewayTimeout}ms)`
                : `✗ Gateway timeout too low (min: ${validationRules.gatewayTimeout.min}ms)`}
            </div>
          </div>
        )}

        {/* Deploy button */}
        {isDeploying ? (
          <div>
            <div className="flex items-center justify-between mb-1 text-xs font-bold uppercase">
              <span className="text-cr-slate">Deploying Hotfix</span>
              <span className="text-cr-orange">{deploymentProgress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-300 border border-cr-slate overflow-hidden">
              <div
                className="h-full bg-cr-orange transition-all duration-300"
                style={{ width: `${deploymentProgress}%` }}
              />
            </div>
            <div className="text-xs text-gray-600 mt-1 font-mono">{deployMessage}</div>
          </div>
        ) : (
          <button
            onClick={startDeployment}
            disabled={!canDeploy}
            className={`w-full py-2.5 font-extrabold text-sm uppercase tracking-widest border-2 transition-all ${
              canDeploy
                ? 'bg-cr-orange text-white border-cr-orange hover:bg-cr-orange/90 cursor-pointer animate-pulse-orange'
                : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
            }`}
          >
            ▶ Deploy Hotfix
          </button>
        )}
      </div>
    </div>
  );
}
