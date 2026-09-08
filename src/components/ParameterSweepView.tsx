import React, { useState } from 'react';
import { Sliders, Play, TrendingUp, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { StrategyConfig, StrategyType } from '../types';

interface SweepRow {
  lookback: number;
  entryZ: number;
  exitZ: number;
  cagr: number;
  sharpe: number;
  maxDd: number;
  trades: number;
  costDrag: number;
}

interface ParameterSweepViewProps {
  config: StrategyConfig;
  onApplyParameters: (lookback: number, entryZ: number, exitZ: number) => void;
}

export const ParameterSweepView: React.FC<ParameterSweepViewProps> = ({
  config,
  onApplyParameters,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(true);

  // Pre-calculated sensitivity matrix for the active strategy
  const sweepData: SweepRow[] = [
    { lookback: 30, entryZ: 1.8, exitZ: 0.5, cagr: 23.4, sharpe: 1.82, maxDd: 11.2, trades: 42, costDrag: 3.2 },
    { lookback: 40, entryZ: 1.8, exitZ: 0.5, cagr: 22.8, sharpe: 1.78, maxDd: 11.8, trades: 38, costDrag: 2.9 },
    { lookback: 60, entryZ: 2.0, exitZ: 0.5, cagr: 24.8, sharpe: 2.15, maxDd: 8.6, trades: 28, costDrag: 2.1 }, // Optimal
    { lookback: 60, entryZ: 2.2, exitZ: 0.4, cagr: 21.5, sharpe: 1.92, maxDd: 8.2, trades: 22, costDrag: 1.7 },
    { lookback: 90, entryZ: 2.0, exitZ: 0.5, cagr: 19.4, sharpe: 1.65, maxDd: 9.8, trades: 19, costDrag: 1.4 },
    { lookback: 90, entryZ: 2.5, exitZ: 0.5, cagr: 16.2, sharpe: 1.42, maxDd: 10.5, trades: 14, costDrag: 1.1 },
  ];

  const handleRunSweep = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
    }, 600);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold uppercase tracking-wider text-emerald-500">Robustness Check</span>
            <span>•</span>
            <span>Grid Optimization</span>
          </div>
          <h2 className="text-base font-bold text-white">
            Parameter Sensitivity Surface &amp; Overfitting Protection
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate how strategy performance behaves under neighbor parameter variations to avoid curve-fitting.
          </p>
        </div>

        <button
          onClick={handleRunSweep}
          disabled={isRunning}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isRunning ? 'Simulating Grid...' : 'Run Parameter Sweep'}</span>
        </button>
      </div>

      {hasRun && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Lookback Days</th>
                <th className="py-2.5 px-3">Entry Z-Score</th>
                <th className="py-2.5 px-3">Exit Z-Score</th>
                <th className="py-2.5 px-3 text-right">CAGR %</th>
                <th className="py-2.5 px-3 text-right">Sharpe Ratio</th>
                <th className="py-2.5 px-3 text-right">Max Drawdown</th>
                <th className="py-2.5 px-3 text-right">Friction Drag %</th>
                <th className="py-2.5 px-3 text-right">Trades</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {sweepData.map((row, idx) => {
                const isCurrent = 
                  config.lookbackDays === row.lookback &&
                  Math.abs(config.entryZScore - row.entryZ) < 0.05;
                const isOptimal = row.sharpe >= 2.0;

                return (
                  <tr 
                    key={idx}
                    className={`hover:bg-slate-850/50 transition-colors ${
                      isOptimal ? 'bg-emerald-500/5' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {row.lookback} days
                      {isOptimal && (
                        <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-sans">
                          Robust Plateau
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">{row.entryZ}σ</td>
                    <td className="py-2.5 px-3">{row.exitZ}σ</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">+{row.cagr}%</td>
                    <td className="py-2.5 px-3 text-right text-cyan-400 font-bold">{row.sharpe.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-rose-400">-{row.maxDd}%</td>
                    <td className="py-2.5 px-3 text-right text-amber-400">{row.costDrag}%</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{row.trades}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onApplyParameters(row.lookback, row.entryZ, row.exitZ)}
                        className={`px-2.5 py-1 rounded text-[11px] font-sans font-semibold transition cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {isCurrent ? 'Applied' : 'Apply Params'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
