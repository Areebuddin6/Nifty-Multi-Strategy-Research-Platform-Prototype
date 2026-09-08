import React, { useState } from 'react';
import { EquityCurvePoint } from '../types';

interface EquityChartProps {
  data: EquityCurvePoint[];
  initialCapital: number;
}

export const EquityChart: React.FC<EquityChartProps> = ({ data, initialCapital }) => {
  const [hoveredPoint, setHoveredPoint] = useState<EquityCurvePoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        No equity curve data available.
      </div>
    );
  }

  // Calculate scales
  const allEquities = data.map(d => d.equity);
  const allBenchmarks = data.map(d => d.benchmarkEquity);
  const minVal = Math.min(...allEquities, ...allBenchmarks, initialCapital * 0.9);
  const maxVal = Math.max(...allEquities, ...allBenchmarks, initialCapital * 1.1);

  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 30, left: 70 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => {
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
  };

  // SVG path for Strategy Equity Curve
  const strategyPath = data.reduce((path, point, i) => {
    const x = getX(i);
    const y = getY(point.equity);
    return `${path} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }, '');

  // Area under strategy curve
  const areaPath = `${strategyPath} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`;

  // Benchmark curve path
  const benchmarkPath = data.reduce((path, point, i) => {
    const x = getX(i);
    const y = getY(point.benchmarkEquity);
    return `${path} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }, '');

  // Format currency
  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="relative w-full">
      {/* Legend & Current Hover */}
      <div className="flex flex-wrap items-center justify-between text-xs mb-3 px-1">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1 bg-emerald-400 rounded-full inline-block" />
            <span className="text-slate-300 font-medium">Strategy (Net of STT &amp; Taxes)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1 bg-slate-500 rounded-full inline-block" />
            <span className="text-slate-400">Nifty 50 Benchmark Buy &amp; Hold</span>
          </div>
        </div>

        {hoveredPoint && (
          <div className="text-xs font-mono text-slate-300 bg-slate-850 px-2 py-1 rounded border border-slate-700">
            <span>{hoveredPoint.date}: </span>
            <span className="text-emerald-400 font-bold">{formatINR(hoveredPoint.equity)}</span>
            <span className="text-slate-500 mx-1.5">|</span>
            <span className="text-slate-400">DD: -{hoveredPoint.drawdownPct.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* SVG Chart Container */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-72 select-none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + chartHeight * (1 - ratio);
            const val = minVal + (maxVal - minVal) * ratio;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] font-mono"
                >
                  {formatINR(val)}
                </text>
              </g>
            );
          })}

          {/* Date ticks on X axis */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const index = Math.min(data.length - 1, Math.floor(ratio * (data.length - 1)));
            const x = getX(index);
            const dateStr = data[index]?.date || '';
            return (
              <text
                key={i}
                x={x}
                y={height - 8}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-mono"
              >
                {dateStr}
              </text>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#equityGradient)" />

          {/* Benchmark line */}
          <path
            d={benchmarkPath}
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Strategy line */}
          <path
            d={strategyPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover interactive overlay */}
          {data.map((point, i) => {
            const x = getX(i);
            const y = getY(point.equity);
            return (
              <rect
                key={i}
                x={x - chartWidth / data.length / 2}
                y={padding.top}
                width={chartWidth / data.length}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredPoint(point)}
                className="cursor-crosshair"
              />
            );
          })}

          {/* Hover indicator point */}
          {hoveredPoint && (
            <circle
              cx={getX(data.findIndex(d => d.date === hoveredPoint.date))}
              cy={getY(hoveredPoint.equity)}
              r="4.5"
              className="fill-emerald-400 stroke-slate-900 stroke-2"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
