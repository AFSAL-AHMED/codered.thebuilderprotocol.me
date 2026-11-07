import { useCallback } from 'react';
import {
  commandHelp,
  systemStatus,
  apiLogs,
  trafficRouting,
  dbConnections,
  gatewayConfig,
} from '../data/commands.js';

function timestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `2024-03-15 ${pad(14)}:${pad(23)}:${pad(now.getSeconds())}`;
}

export default function useTerminal(gameState) {
  const {
    addClue,
    addTerminalEntry,
    clearTerminal,
    cluesFound,
    incrementCommandCount,
  } = gameState;

  const processCommand = useCallback(
    (input) => {
      const trimmed = input.trim().toLowerCase();
      incrementCommandCount();

      /* Echo the command itself */
      addTerminalEntry({ type: 'command', text: input.trim() });

      if (trimmed === 'clear') {
        clearTerminal();
        return;
      }

      if (trimmed === 'help') {
        const lines = [
          '┌──────────────────────────────────────────────────┐',
          '│          AVAILABLE COMMANDS                      │',
          '├──────────────────────────────────────────────────┤',
          ...commandHelp.map(
            (c) =>
              `│  ${c.cmd.padEnd(28)}${c.desc.padEnd(20)}│`,
          ),
          '└──────────────────────────────────────────────────┘',
        ];
        addTerminalEntry({ type: 'output', lines });
        return;
      }

      if (trimmed === 'sys status') {
        addTerminalEntry({ type: 'output', lines: systemStatus });
        return;
      }

      if (trimmed === 'service logs --api') {
        const lines = apiLogs.map(
          (entry) =>
            `[${timestamp()}] ${entry.level}: ${entry.msg}`,
        );
        addTerminalEntry({
          type: 'log',
          lines,
          logEntries: apiLogs,
        });

        const alreadyHad = cluesFound.includes('api-logs');
        addClue('api-logs');
        if (!alreadyHad) {
          addTerminalEntry({
            type: 'system',
            text: '🔍 CLUE DISCOVERED: API gateway logs reveal connection pool exhaustion and dangerously low timeout thresholds.',
          });
        }
        return;
      }

      if (trimmed === 'traffic routing') {
        addTerminalEntry({ type: 'output', lines: trafficRouting });
        return;
      }

      if (trimmed === 'db connections') {
        addTerminalEntry({ type: 'output', lines: dbConnections });

        const alreadyHad = cluesFound.includes('db-pool');
        addClue('db-pool');
        if (!alreadyHad) {
          addTerminalEntry({
            type: 'system',
            text: '🔍 CLUE DISCOVERED: Database connection pool stuck at factory default (5). Production requires 50-200.',
          });
        }
        return;
      }

      if (trimmed === 'config inspect --gateway') {
        addTerminalEntry({ type: 'config', lines: gatewayConfig });

        const alreadyHad = cluesFound.includes('gateway-config');
        addClue('gateway-config');
        if (!alreadyHad) {
          addTerminalEntry({
            type: 'system',
            text: '🔍 CLUE DISCOVERED: Gateway timeout at 3000ms with keepAlive disabled. Critical misconfiguration confirmed.',
          });
        }
        return;
      }

      /* Unknown command */
      addTerminalEntry({
        type: 'error',
        text: `Command not found: "${input.trim()}". Type 'help' for available commands.`,
      });
    },
    [addClue, addTerminalEntry, clearTerminal, cluesFound, incrementCommandCount],
  );

  return { processCommand };
}
