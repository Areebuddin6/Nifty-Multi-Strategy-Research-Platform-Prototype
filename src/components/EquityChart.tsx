import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { DailyReturn, ThemeMode } from '../types';

interface EquityChartProps {
  dailyReturns: DailyReturn[];
  initialCapital: number;
  theme?: ThemeMode;
}

export const EquityChart: React.FC<EquityChartProps> = ({ dailyReturns, initialCapital, theme = 'dark' }) => {
  const [chartMode, setChartMode] = useState<'equity' | 'return'>('equity');
  const [showDrawdown, setShowDrawdown] = useState<boolean>(true);

  if (!dailyReturns || dailyReturns.length === 0) {
    return <div className="p-8 text-center text-slate-500">No simulation data available.</div>;
  }

  const isLight = theme === 'light';
  const gridColor = isLight ? '#e2e8f0' : '#1e293b';
  const axisColor = isLight ? '#64748b' : '#64748b';
  const benchLineColor = isLight ? '#94a3b8' : '#64748b';
  const tooltipStyle = isLight
    ? {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#0f172a',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      }
    : {
        backgroundColor: '#020617',
        borderColor: '#334155',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#f8fafc',
      };

  const sampleRate = Math.max(1, Math.floor(dailyReturns.length / 160));
  const initialBench = dailyReturns[0]?.benchmarkValue || 10500;

  const chartData = dailyReturns
    .filter((_, idx) => idx % sampleRate === 0 || idx === dailyReturns.length - 1)
    .map((d) => {
      const stratReturnPct = ((d.portfolioValue - initialCapital) / initialCapital) * 100;
      const benchReturnPct = ((d.benchmarkValue - initialBench) / initialBench) * 100;
      const benchEquityValue = initialCapital * (1 + benchReturnPct / 100);

      return {
        date: d.date,
        portfolioValue: Math.round(d.portfolioValue),
        benchmarkEquity: Math.round(benchEquityValue),
        stratReturnPct: parseFloat(stratReturnPct.toFixed(2)),
        benchReturnPct: parseFloat(benchReturnPct.toFixed(2)),
        drawdown: -parseFloat(d.drawdown.toFixed(2)),
        benchDrawdown: -parseFloat(d.benchmarkDrawdown.toFixed(2)),
      };
    });

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 transition-colors shadow-sm">
      {/* Chart Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
            <span>Cumulative Performance vs NIFTY 50 Benchmark</span>
          </h3>
          <p className="text-xs text-slate-400">
            Realized day-by-day equity progression net of all Indian taxes, STT &amp; slippage
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              id="btn-chart-equity"
              onClick={() => setChartMode('equity')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                chartMode === 'equity'
                  ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rupees (₹)
            </button>
            <button
              id="btn-chart-return"
              onClick={() => setChartMode('return')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                chartMode === 'return'
                  ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Return (%)
            </button>
          </div>

          <button
            id="btn-toggle-drawdown"
            onClick={() => setShowDrawdown(!showDrawdown)}
            className={`px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
              showDrawdown
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            {showDrawdown ? 'Hide Drawdown' : 'Show Drawdown'}
          </button>
        </div>
      </div>

      {/* Main Equity Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="date"
              stroke={axisColor}
              fontSize={11}
              tickLine={false}
              tickFormatter={(d) => d.slice(0, 7)}
            />
            <YAxis
              stroke={axisColor}
              fontSize={11}
              domain={['auto', 'auto']}
              tickFormatter={(v) => (chartMode === 'equity' ? formatCurrency(v) : `${v}%`)}
              orientation="right"
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: any, name: any) => {
                const label = name === 'portfolioValue' || name === 'stratReturnPct' ? 'Strategy Net Equity' : 'NIFTY 50 Buy & Hold';
                const formatted = chartMode === 'equity' ? formatCurrency(Number(value)) : `${Number(value).toFixed(2)}%`;
                return [formatted, label];
              }}
              labelFormatter={(label) => `Trading Day: ${label}`}
            />
            <Legend
              verticalAlign="top"
              height={30}
              formatter={(value) => (
                <span className="text-xs text-slate-300 mr-4 font-mono">
                  {value === 'portfolioValue' || value === 'stratReturnPct' ? 'Strategy Equity' : 'NIFTY 50 Benchmark'}
                </span>
              )}
            />
            {chartMode === 'equity' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="portfolioValue"
                  name="portfolioValue"
                  fill="#10b981"
                  fillOpacity={isLight ? 0.12 : 0.08}
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="benchmarkEquity"
                  name="benchmarkEquity"
                  stroke={benchLineColor}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </>
            ) : (
              <>
                <Area
                  type="monotone"
                  dataKey="stratReturnPct"
                  name="stratReturnPct"
                  fill="#10b981"
                  fillOpacity={isLight ? 0.12 : 0.08}
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="benchReturnPct"
                  name="benchReturnPct"
                  stroke={benchLineColor}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Underwater Drawdown Chart */}
      {showDrawdown && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold">Underwater Drawdown Profile (% from All-Time Peak)</span>
            <span className="font-mono text-[11px] text-slate-500">
              Strategy vs NIFTY 50 Benchmark Peak
            </span>
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis
                  stroke={axisColor}
                  fontSize={10}
                  domain={['auto', 0]}
                  tickFormatter={(v) => `${v}%`}
                  orientation="right"
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val: any, name: any) => [
                    `${Number(val).toFixed(2)}%`,
                    name === 'drawdown' ? 'Strategy Drawdown' : 'Nifty Drawdown',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  name="drawdown"
                  stroke="#f43f5e"
                  fill="#f43f5e"
                  fillOpacity={isLight ? 0.2 : 0.25}
                  strokeWidth={1.2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="benchDrawdown"
                  name="benchDrawdown"
                  stroke={benchLineColor}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
