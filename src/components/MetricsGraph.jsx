import React, { useMemo } from 'react';

function MiniChart({ data, color, width = 200, height = 60 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  /* Create fill polygon */
  const fillPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height: `${height}px` }}
      preserveAspectRatio="none"
    >
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((frac) => (
        <line
          key={frac}
          x1={0}
          y1={height * frac}
          x2={width}
          y2={height * frac}
          stroke="#333"
          strokeWidth="0.5"
          strokeDasharray="4,4"
        />
      ))}
      {/* Fill area */}
      <polygon points={fillPoints} fill={color} opacity={0.1} />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Current value dot */}
      {data.length > 0 && (() => {
        const lastX = width;
        const lastY = height - ((data[data.length - 1] - min) / range) * (height - 8) - 4;
        return (
          <circle cx={lastX} cy={lastY} r="3" fill={color} stroke="#0D0D0D" strokeWidth="1" />
        );
      })()}
    </svg>
  );
}

function getStatusColor(value, thresholds) {
  if (value >= thresholds.critical) return '#FF5722';
  if (value >= thresholds.warning) return '#FFC107';
  return '#4CAF50';
}

function MetricPanel({ label, value, unit, data, thresholds, formatValue }) {
  const color = getStatusColor(
    typeof thresholds.getValue === 'function' ? thresholds.getValue(value) : value,
    thresholds,
  );

  const statusLabel =
    color === '#FF5722' ? 'CRITICAL' : color === '#FFC107' ? 'WARNING' : 'NOMINAL';

  const displayVal = formatValue ? formatValue(value) : Math.round(value);

  return (
    <div className="border-2 border-cr-slate p-3 bg-white flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-cr-slate">
          {label}
        </span>
        <span
          className="text-[9px] font-bold uppercase px-1.5 py-0.5"
          style={{ backgroundColor: color, color: color === '#FFC107' ? '#1A1A1A' : '#fff' }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-extrabold" style={{ color }}>
          {displayVal}
        </span>
        <span className="text-xs text-gray-500 font-bold uppercase">{unit}</span>
      </div>

      <div className="bg-cr-terminal p-1.5 border border-gray-800">
        <MiniChart data={data} color={color} />
      </div>
    </div>
  );
}

export default function MetricsGraph({ metrics }) {
  const { cpu, errorRate, memory, responseTime } = metrics;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-cr-slate border-b-2 border-cr-slate select-none shrink-0">
        <span className="w-2 h-2 rounded-full bg-cr-cyan inline-block" />
        <span className="text-white font-bold text-xs uppercase tracking-widest">Live Metrics</span>
        <span className="text-gray-500 text-xs ml-auto uppercase">1s interval</span>
      </div>

      {/* 2x2 Grid */}
      <div className="flex-1 grid grid-cols-2 gap-0 p-2 bg-cr-bg overflow-auto">
        <MetricPanel
          label="CPU Saturation"
          value={cpu.current}
          unit="%"
          data={cpu.data}
          thresholds={{ critical: 80, warning: 50, getValue: (v) => v }}
        />
        <MetricPanel
          label="504 Gateway Errors"
          value={errorRate.current}
          unit="/min"
          data={errorRate.data}
          thresholds={{ critical: 20, warning: 10, getValue: (v) => v }}
          formatValue={(v) => Math.round(v * 12)} /* Scale percentage to per-minute count */
        />
        <MetricPanel
          label="Memory Utilization"
          value={memory.current}
          unit="%"
          data={memory.data}
          thresholds={{ critical: 80, warning: 60, getValue: (v) => v }}
        />
        <MetricPanel
          label="Avg Response Time"
          value={responseTime.current}
          unit="ms"
          data={responseTime.data}
          thresholds={{ critical: 1000, warning: 300, getValue: (v) => v }}
          formatValue={(v) => {
            if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
            return Math.round(v);
          }}
        />
      </div>
    </div>
  );
}
