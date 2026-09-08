import React, { useState } from 'react';
import { SpreadPoint } from '../types';

interface SpreadZScoreChartProps {
  data: SpreadPoint[];
  entryZ: number;
  exitZ: number;
  pairName?: string;
}

export const SpreadZScoreChart: React.FC<SpreadZScoreChartProps> = ({
  data,
  entryZ,
  exitZ,
  pairName = 'Pair Spread',
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<SpreadPoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        No spread / Z-score time series available. Select Pairs Cointegration or Basket Stat-Arb.
      </div>
    );
  }

  const allZ = data.map(d => d.zScore);
  const minZ = Math.min(-3.5, ...allZ);
  const maxZ = Math.max(3.5, ...allZ);

  const width = 800;
  const height = 280;
  const padding = { top: 20, right: 30, bottom: 30, left: 55 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => {
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getZ_Y = (z: number) => {
    return padding.top + chartHeight - ((z - minZ) / (maxZ - minZ)) * chartHeight;
  };

  // Line path for Z-score
  const zPath = data.reduce((path, point, i) => {
    const x = getX(i);
    const y = getZ_Y(point.zScore);
    return `${path} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }, '');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
            <span>{pairName} Residual Spread &amp; Z-Score Tracking</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ADF Cointegrated
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical divergence from rolling hedge ratio equilibrium. Reversion triggered at ±{entryZ}σ threshold.
          </p>
        </div>

        {hoveredPoint && (
          <div className="text-xs font-mono text-slate-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            <span>{hoveredPoint.date}: </span>
            <span className="text-cyan-400 font-bold">Z: {hoveredPoint.zScore.toFixed(2)}σ</span>
            <span className="text-slate-500 mx-1.5">|</span>
            <span className="text-slate-400">Spread: ₹{hoveredPoint.spread.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-72 select-none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Zero Mean Line */}
          <line
            x1={padding.left}
            y1={getZ_Y(0)}
            x2={width - padding.right}
            y2={getZ_Y(0)}
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* +Entry Z threshold */}
          <line
            x1={padding.left}
            y1={getZ_Y(entryZ)}
            x2={width - padding.right}
            y2={getZ_Y(entryZ)}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text
            x={width - padding.right + 4}
            y={getZ_Y(entryZ) + 3}
            className="fill-rose-400 text-[9px] font-mono"
          >
            +{entryZ}σ Short Spread
          </text>

          {/* -Entry Z threshold */}
          <line
            x1={padding.left}
            y1={getZ_Y(-entryZ)}
            x2={width - padding.right}
            y2={getZ_Y(-entryZ)}
            stroke="#10b981"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text
            x={width - padding.right + 4}
            y={getZ_Y(-entryZ) + 3}
            className="fill-emerald-400 text-[9px] font-mono"
          >
            -{entryZ}σ Long Spread
          </text>

          {/* Exit threshold bounds */}
          <line
            x1={padding.left}
            y1={getZ_Y(exitZ)}
            x2={width - padding.right}
            y2={getZ_Y(exitZ)}
            stroke="#eab308"
            strokeDasharray="2 2"
            strokeWidth="0.8"
          />
          <line
            x1={padding.left}
            y1={getZ_Y(-exitZ)}
            x2={width - padding.right}
            y2={getZ_Y(-exitZ)}
            stroke="#eab308"
            strokeDasharray="2 2"
            strokeWidth="0.8"
          />

          {/* Z-Ticks on Left Axis */}
          {[-3, -2, -1, 0, 1, 2, 3].map((zVal) => {
            const y = getZ_Y(zVal);
            return (
              <g key={zVal}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="2 2"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] font-mono"
                >
                  {zVal > 0 ? `+${zVal}σ` : `${zVal}σ`}
                </text>
              </g>
            );
          })}

          {/* Actual Z-score continuous path */}
          <path
            d={zPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover interactive overlay */}
          {data.map((point, i) => {
            const x = getX(i);
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

          {hoveredPoint && (
            <circle
              cx={getX(data.findIndex(d => d.date === hoveredPoint.date))}
              cy={getZ_Y(hoveredPoint.zScore)}
              r="4"
              className="fill-cyan-400 stroke-slate-900 stroke-2"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
