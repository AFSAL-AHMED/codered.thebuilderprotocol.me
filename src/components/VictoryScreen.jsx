import React from 'react';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function StatCard({ label, value, color = '#1A1A1A' }) {
  return (
    <div className="border-2 border-cr-slate p-3 bg-white text-center">
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
        {label}
      </div>
      <div className="text-xl font-extrabold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function MiniHealthCard({ label, value, unit, color }) {
  return (
    <div className="border-2 border-cr-slate p-2 bg-white text-center">
      <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{label}</div>
      <div className="text-lg font-extrabold" style={{ color }}>
        {value}
        <span className="text-xs text-gray-400 ml-0.5">{unit}</span>
      </div>
    </div>
  );
}

export default function VictoryScreen({ gameState, metrics, onRestart }) {
  const { incidentTimer, commandCount, connectionPoolSize, gatewayTimeout } = gameState;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
         style={{ backgroundColor: 'rgba(244, 244, 240, 0.97)' }}>
      <div className="max-w-2xl w-full mx-4 animate-slide-up">
        {/* Main card */}
        <div className="border-3 border-cr-slate bg-white p-8" style={{ borderWidth: '3px', borderColor: '#1A1A1A', borderStyle: 'solid' }}>
          {/* Title */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">✅</div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-cr-slate uppercase tracking-wider mb-2">
              Incident Mitigated
            </h1>
            <p className="text-cr-green font-extrabold text-lg uppercase tracking-widest">
              System Nominal
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            <StatCard label="Resolution Time" value={formatTime(incidentTimer)} color="#FF5722" />
            <StatCard label="Commands Executed" value={commandCount} />
            <StatCard label="Clues Found" value="3/3" color="#4CAF50" />
            <StatCard label="Pool Size" value={connectionPoolSize} color="#00BCD4" />
            <StatCard label="Gateway Timeout" value={`${gatewayTimeout}ms`} color="#00BCD4" />
            <StatCard label="Status" value="HEALTHY" color="#4CAF50" />
          </div>

          {/* Mini health cards */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <MiniHealthCard label="CPU" value="20" unit="%" color="#4CAF50" />
            <MiniHealthCard label="Errors" value="0" unit="/m" color="#4CAF50" />
            <MiniHealthCard label="Memory" value="45" unit="%" color="#4CAF50" />
            <MiniHealthCard label="Latency" value="80" unit="ms" color="#4CAF50" />
          </div>

          {/* Post-mortem */}
          <div className="border-2 border-cr-slate p-4 mb-6 bg-cr-bg">
            <h3 className="font-extrabold text-xs uppercase tracking-widest text-cr-slate mb-2 border-b-2 border-cr-slate pb-1">
              Post-Mortem Summary
            </h3>
            <div className="text-xs font-mono text-gray-700 space-y-1.5 leading-relaxed">
              <p>
                <strong>Root Cause:</strong> Database connection pool misconfiguration. Pool size was
                set to factory default of 5 connections, causing connection exhaustion under
                production load of ~12,800 req/s.
              </p>
              <p>
                <strong>Contributing Factor:</strong> Gateway upstream timeout set to 3000ms — too
                low for database queries under contention. keepAlive was disabled, forcing new TCP
                connections per request.
              </p>
              <p>
                <strong>Resolution:</strong> Pool size increased to {connectionPoolSize} connections.
                Gateway timeout increased to {gatewayTimeout}ms. Configuration deployed via rolling
                update across all production nodes.
              </p>
              <p>
                <strong>Action Items:</strong> Implement connection pool monitoring alerts. Set
                minimum pool size guardrails in CI/CD pipeline. Add load testing to deployment
                checklist.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <button
            onClick={onRestart}
            className="w-full py-3 bg-cr-slate text-white font-extrabold text-sm uppercase tracking-widest border-2 border-cr-slate hover:bg-gray-800 transition-colors mb-3"
          >
            ▶ Run Another Drill
          </button>

          <div className="text-center mt-4 py-3 border-t-2 border-cr-slate">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Master distributed systems architecture →{' '}
            </span>
            <a
              href="https://learn.thebuilderprotocol.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cr-orange font-extrabold uppercase text-xs tracking-wider hover:underline"
            >
              learn.thebuilderprotocol.me
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
