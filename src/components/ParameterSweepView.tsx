import React, { useState } from 'react';
import { Sliders, Play, RefreshCw, BarChart2, Check, ArrowRight } from 'lucide-react';
import { StrategyConfig } from '../types';
import { runBacktestSimulation } from '../engine/backtestSimulator';
import { HISTORICAL_NIFTY_DAILY } from '../data/historicalData';

interface ParameterSweepViewProps {
  config: StrategyConfig;
  onApplyParameters: (lookback: number, entryZ: number) => void;
}

interface SweepResult {
  lookback: number;
  entryZ: number;
  cagr: number;
  sharpe: number;
  maxDd: number;
  winRate: number;
  trades: number;
}

export const ParameterSweepView: React.FC<ParameterSweepViewProps> = ({
  config,
  onApplyParameters,
}) => {
  const [isSweeping, setIsSweeping] = useState(false);
  const [results, setResults] = useState<SweepResult[]>(() => {
    // Generate initial 3x3 grid
    const lookbacks = [30, 60, 90];
    const entryZs = [1.6, 2.0, 2.4];
    const grid: SweepResult[] = [];

    for (const lb of lookbacks) {
      for (const ez of entryZs) {
        const sweepCfg: StrategyConfig = {
          ...config,
          lookbackDays: lb,
          entryZScore: ez,
        };
        const res = runBacktestSimulation(sweepCfg, HISTORICAL_NIFTY_DAILY);
        grid.push({
          lookback: lb,
          entryZ: ez,
          cagr: parseFloat(res.stats.cagrPct.toFixed(1)),
          sharpe: parseFloat(res.stats.sharpeRatio.toFixed(2)),
          maxDd: parseFloat(res.stats.maxDrawdownPct.toFixed(1)),
          winRate: parseFloat(res.stats.winRatePct.toFixed(0)),
          trades: res.stats.totalTrades,
        });
      }
    }
    return grid;
  });

  const handleRunCustomSweep = () => {
    setIsSweeping(true);
    setTimeout(() => {
      const lookbacks = [20, 40, 60, 80, 100];
      const entryZs = [1.5, 1.8, 2.0, 2.3, 2.6];
      const grid: SweepResult[] = [];

      for (const lb of lookbacks) {
        for (const ez of entryZs) {
          const sweepCfg: StrategyConfig = {
            ...config,
            lookbackDays: lb,
            entryZScore: ez,
          };
          const res = runBacktestSimulation(sweepCfg, HISTORICAL_NIFTY_DAILY);
          grid.push({
            lookback: lb,
            entryZ: ez,
            cagr: parseFloat(res.stats.cagrPct.toFixed(1)),
            sharpe: parseFloat(res.stats.sharpeRatio.toFixed(2)),
            maxDd: parseFloat(res.stats.maxDrawdownPct.toFixed(1)),
            winRate: parseFloat(res.stats.winRatePct.toFixed(0)),
            trades: res.stats.totalTrades,
          });
        }
      }
      setResults(grid);
      setIsSweeping(false);
    }, 450);
  };

  const bestSharpe = Math.max(...results.map((r) => r.sharpe));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold uppercase tracking-wider text-emerald-500">Robustness Analysis</span>
            <span>•</span>
            <span>{config.name}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Parameter Grid Surface Sweep
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test sensitivity across lookback periods and entry Z-Score divergence to ensure the strategy is not over-optimized on a single lucky parameter spike.
          </p>
        </div>

        <button
          onClick={handleRunCustomSweep}
          disabled={isSweeping}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center space-x-2 transition cursor-pointer disabled:opacity-50 shadow-sm"
        >
          {isSweeping ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Sweeping 25 Combos...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run 5x5 Full Surface Sweep</span>
            </>
          )}
        </button>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {results.map((r, idx) => {
          const isBest = r.sharpe === bestSharpe;
          const isCurrent = r.lookback === config.lookbackDays && Math.abs(r.entryZ - config.entryZScore) < 0.05;

          return (
            <div
              key={idx}
              className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                isBest
                  ? 'bg-slate-850 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-white">
                    Lookback: {r.lookback}d • Entry: ±{r.entryZ}σ
                  </span>
                  {isBest && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Optimal Frontier
                    </span>
                  )}
                  {isCurrent && !isBest && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Current
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 my-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Sharpe Ratio</span>
                    <span className="text-sm font-bold text-white">{r.sharpe}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Annual CAGR</span>
                    <span className="text-sm font-bold text-emerald-400">+{r.cagr}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Max Drawdown</span>
                    <span className="text-xs font-semibold text-rose-400">-{r.maxDd}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Win Rate</span>
                    <span className="text-xs font-semibold text-slate-300">{r.winRate}% ({r.trades} tr)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 mt-1 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => onApplyParameters(r.lookback, r.entryZ)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-semibold cursor-pointer"
                >
                  <span>Apply Parameters</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
