import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { SpreadPoint } from '../engine/backtestSimulator';
import { StrategyConfig, ThemeMode } from '../types';
import { PAIR_CANDIDATES, BASKET_CANDIDATES } from '../data/historicalData';

interface SpreadZScoreChartProps {
  spreadPoints: SpreadPoint[];
  config: StrategyConfig;
  theme?: ThemeMode;
}

export const SpreadZScoreChart: React.FC<SpreadZScoreChartProps> = ({
  spreadPoints,
  config,
  theme = 'dark',
}) => {
  const isPair = config.id === 'pairs_cointegration';
  const isBasket = config.id === 'basket_meanreversion';
  const isLight = theme === 'light';

  const pairInfo = isPair
    ? PAIR_CANDIDATES.find((p) => p.pairId === config.selectedPair) || PAIR_CANDIDATES[0]
    : null;

  const basketInfo = isBasket
    ? BASKET_CANDIDATES.find((b) => b.basketId === config.selectedBasket) || BASKET_CANDIDATES[0]
    : null;

  if (!isPair && !isBasket) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <h4 className="text-base font-semibold text-slate-200 mb-2">
          Spread &amp; Z-Score Tracking is strategy-specific
        </h4>
        <p className="text-xs max-w-md mx-auto text-slate-400 mb-4">
          The active strategy is <span className="text-emerald-400 font-mono">{config.name}</span>.
          Spread tracking and ADF cointegration mean-reversion analysis are enabled for Pairs Cointegration and Basket Stat-Arb.
        </p>
        <span className="text-xs font-mono text-slate-500">
          Switch to "Pairs Cointegration" or "Basket Stat-Arb" in the configuration panel above to view real-time spread dynamics.
        </span>
      </div>
    );
  }

  const gridColor = isLight ? '#e2e8f0' : '#1e293b';
  const axisColor = isLight ? '#64748b' : '#64748b';
  const zeroLineColor = isLight ? '#94a3b8' : '#475569';
  const tooltipStyle = isLight
    ? {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderRadius: '8px',
        fontSize: '11px',
        color: '#0f172a',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      }
    : {
        backgroundColor: '#020617',
        borderColor: '#334155',
        borderRadius: '8px',
        fontSize: '11px',
        color: '#f8fafc',
      };

  const sampleRate = Math.max(1, Math.floor(spreadPoints.length / 140));
  const chartData = spreadPoints.filter((_, idx) => idx % sampleRate === 0 || idx === spreadPoints.length - 1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 transition-colors shadow-sm">
      {/* Header with Cointegration & Spread Diagnostics */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-slate-100">
              {isPair
                ? `Pairs Cointegration Spread: ${pairInfo?.stockA} / ${pairInfo?.stockB}`
                : `Basket Stat-Arb Dispersion: ${basketInfo?.name}`}
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              {isPair ? 'ADF p=0.018 (Cointegrated)' : 'PCA Dispersion Normalized'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rolling {config.lookbackDays}-day mean reversion window with entry at ±{config.entryZScore.toFixed(1)}σ, stop loss at ±{config.stopLossZScore.toFixed(1)}σ
          </p>
        </div>

        {/* Statistical Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {isPair && pairInfo && (
            <>
              <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Hedge Ratio (β): </span>
                <span className="text-emerald-400 font-semibold">{pairInfo.hedgeRatio}</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Half-Life: </span>
                <span className="text-slate-100 font-semibold">{pairInfo.halfLifeDays} days</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Correlation: </span>
                <span className="text-slate-100 font-semibold">{pairInfo.correlation}</span>
              </div>
            </>
          )}

          {isBasket && basketInfo && (
            <>
              <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Basket Legs: </span>
                <span className="text-emerald-400 font-semibold">{basketInfo.tickers.join(', ')}</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Mean Corr: </span>
                <span className="text-slate-100 font-semibold">{basketInfo.meanPairwiseCorrelation}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Z-Score Chart */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
            Rolling Z-Score Time-Series &amp; Threshold Boundaries
          </span>
          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-0.5 bg-emerald-400"></span>
              <span className="text-emerald-400">Entry Threshold (±{config.entryZScore.toFixed(1)}σ)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-0.5 bg-rose-400"></span>
              <span className="text-rose-400">Stop Loss (±{config.stopLossZScore.toFixed(1)}σ)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-0.5 bg-slate-400"></span>
              <span className="text-slate-400">Mean (0.0)</span>
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="date"
                stroke={axisColor}
                fontSize={10}
                tickFormatter={(d) => d.slice(0, 7)}
              />
              <YAxis
                stroke={axisColor}
                fontSize={10}
                domain={[-4.5, 4.5]}
                tickFormatter={(v) => `${v}σ`}
                orientation="right"
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val: any) => [`${Number(val).toFixed(2)} σ`, 'Normalized Z-Score']}
                labelFormatter={(l) => `Date: ${l}`}
              />

              {/* Threshold lines */}
              <ReferenceLine y={0} stroke={zeroLineColor} strokeWidth={1} />
              <ReferenceLine y={config.entryZScore} stroke="#10b981" strokeDasharray="3 3" />
              <ReferenceLine y={-config.entryZScore} stroke="#10b981" strokeDasharray="3 3" />
              <ReferenceLine y={config.stopLossZScore} stroke="#f43f5e" strokeDasharray="2 2" />
              <ReferenceLine y={-config.stopLossZScore} stroke="#f43f5e" strokeDasharray="2 2" />
              <ReferenceLine y={config.exitZScore} stroke="#94a3b8" strokeDasharray="1 3" />
              <ReferenceLine y={-config.exitZScore} stroke="#94a3b8" strokeDasharray="1 3" />

              <Line
                type="monotone"
                dataKey="zScore"
                name="Z-Score"
                stroke="#38bdf8"
                strokeWidth={1.8}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Raw Spread Level Chart */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
            Raw Price Spread &amp; Moving Average Channel
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            {isPair ? `Price(A) - ${pairInfo?.hedgeRatio} × Price(B)` : 'Dispersion Index'}
          </span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 15, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke={gridColor} vertical={false} />
              <XAxis dataKey="date" stroke={axisColor} fontSize={10} tickFormatter={(d) => d.slice(0, 7)} />
              <YAxis stroke={axisColor} fontSize={10} orientation="right" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="mean" stroke="#94a3b8" strokeWidth={1} dot={false} strokeDasharray="4 4" name="Rolling Mean" />
              <Line type="monotone" dataKey="upperBand" stroke="#10b981" strokeWidth={1} dot={false} strokeDasharray="2 2" name="+Entry Band" />
              <Line type="monotone" dataKey="lowerBand" stroke="#10b981" strokeWidth={1} dot={false} strokeDasharray="2 2" name="-Entry Band" />
              <Line type="monotone" dataKey="spread" stroke="#a855f7" strokeWidth={1.5} dot={false} name="Actual Spread" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
