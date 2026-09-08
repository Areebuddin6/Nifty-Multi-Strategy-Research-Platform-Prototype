import React from 'react';
import { IndianRupee, TrendingUp, TrendingDown, CheckCircle2, ShieldAlert, Award, ArrowUpRight } from 'lucide-react';
import { PerformanceStats, CostBreakdown } from '../types';
import { MetricHelpButton } from './MetricHelpButton';

interface SimpleOverviewMetricsProps {
  stats: PerformanceStats;
  initialCapital: number;
  costs: CostBreakdown;
  onOpenCostModal?: () => void;
  onOpenHelp?: (section?: any, topicId?: string) => void;
  onOpenMetricHelp?: (metricId: string) => void;
}

export const SimpleOverviewMetrics: React.FC<SimpleOverviewMetricsProps> = ({
  stats,
  initialCapital,
  costs,
  onOpenCostModal,
  onOpenHelp,
  onOpenMetricHelp,
}) => {
  const netProfit = stats.finalEquity - initialCapital;
  const isProfit = netProfit >= 0;

  const handleHelp = (metricId: string) => {
    if (onOpenMetricHelp) {
      onOpenMetricHelp(metricId);
    } else if (onOpenHelp) {
      onOpenHelp('metrics', metricId);
    }
  };

  const formatINR = (val: number) => {
    const isNeg = val < 0;
    const abs = Math.abs(val);
    if (abs >= 10000000) return `${isNeg ? '-' : ''}₹${(abs / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `${isNeg ? '-' : ''}₹${(abs / 100000).toFixed(2)} Lakh`;
    return `${isNeg ? '-' : ''}₹${abs.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Net Profit in Real Rupees */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center space-x-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Net Profit Realized</span>
            <MetricHelpButton metricId="cagr" onOpenHelp={handleHelp} size="xs" />
          </div>
          <div className={`p-1.5 rounded-lg ${isProfit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className={`text-2xl font-bold font-mono tracking-tight ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
          {formatINR(netProfit)}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-400">Total Gain / Loss</span>
          <span className={`font-mono font-bold ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isProfit ? '+' : ''}{stats.totalReturnPct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 2. Annual Compounded Growth (CAGR) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center space-x-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Annual Return (CAGR)</span>
            <MetricHelpButton metricId="cagr" onOpenHelp={handleHelp} size="xs" />
          </div>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-white tracking-tight">
          {stats.cagrPct.toFixed(1)}% <span className="text-xs font-normal text-slate-400">per year</span>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-400">Nifty 50 Benchmark</span>
          <span className="font-mono text-slate-300 font-semibold">{stats.benchmarkCagrPct.toFixed(1)}% / yr</span>
        </div>
      </div>

      {/* 3. Trade Accuracy (Win Rate) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center space-x-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Win Rate</span>
            <MetricHelpButton metricId="win_rate" onOpenHelp={handleHelp} size="xs" />
          </div>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-white tracking-tight">
          {stats.winRatePct.toFixed(0)}% <span className="text-xs font-normal text-slate-400">winners</span>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-400">Winning Trades</span>
          <span className="font-mono text-slate-300 font-semibold">
            {stats.winningTrades} of {stats.totalTrades} completed
          </span>
        </div>
      </div>

      {/* 4. Total Taxes & Brokerage Paid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center space-x-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Taxes &amp; Brokerage</span>
            <MetricHelpButton metricId="cost_drag" onOpenHelp={handleHelp} size="xs" />
          </div>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
          {formatINR(costs.total)}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center space-x-1 text-slate-400">
            <span>Max Drop (Risk)</span>
            <MetricHelpButton metricId="max_drawdown" onOpenHelp={handleHelp} size="xs" />
          </div>
          <span className="font-mono text-rose-400 font-semibold">-{stats.maxDrawdownPct.toFixed(1)}% peak</span>
        </div>
      </div>
    </div>
  );
};
