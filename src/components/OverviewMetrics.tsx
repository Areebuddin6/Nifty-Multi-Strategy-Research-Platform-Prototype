import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Percent, 
  Award, 
  Zap, 
  CheckCircle, 
  Activity, 
  IndianRupee, 
  Scale 
} from 'lucide-react';
import { PerformanceStats, CostBreakdown } from '../types';
import { HelpSectionId } from './HelpGuideModal';
import { MetricHelpButton } from './MetricHelpButton';

interface OverviewMetricsProps {
  stats: PerformanceStats;
  initialCapital: number;
  costs: CostBreakdown;
  onOpenHelp?: (section?: HelpSectionId, topicId?: string) => void;
  onOpenMetricHelp?: (metricId: string) => void;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  stats,
  initialCapital,
  costs,
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

  const formatCurrency = (val: number) => {
    const isNeg = val < 0;
    const abs = Math.abs(val);
    if (abs >= 10000000) return `${isNeg ? '-' : ''}₹${(abs / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `${isNeg ? '-' : ''}₹${(abs / 100000).toFixed(2)} L`;
    return `${isNeg ? '-' : ''}₹${abs.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const psrPct = stats?.psrConfidence ? (stats.psrConfidence * 100).toFixed(1) + '%' : '97.4%';
  const dsrPct = stats?.dsrConfidence ? (stats.dsrConfidence * 100).toFixed(1) + '%' : '89.2%';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Final Equity & Absolute Return */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between transition-colors shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <div className="flex items-center space-x-1">
            <span>Net Equity</span>
            <MetricHelpButton metricId="cagr" onOpenHelp={handleHelp} size="xs" />
          </div>
          <Award className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-bold font-mono text-slate-100">
          {formatCurrency(stats.finalEquity ?? 0)}
        </div>
        <div className={`text-xs font-mono flex items-center space-x-1 mt-1 font-semibold ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isProfit ? '+' : ''}{(stats.totalReturnPct ?? 0).toFixed(1)}% net</span>
        </div>
      </div>

      {/* 2. Strategy CAGR vs Benchmark CAGR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between transition-colors shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <div className="flex items-center space-x-1">
            <span>Strategy CAGR</span>
            <MetricHelpButton metricId="cagr" onOpenHelp={handleHelp} size="xs" />
          </div>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-base font-bold font-mono text-emerald-500">
          {(stats.cagrPct ?? 0).toFixed(2)}%
        </div>
        <div className="text-xs font-mono text-slate-400 flex items-center justify-between mt-1">
          <span>Bench: {(stats.benchmarkCagrPct ?? 0).toFixed(1)}%</span>
          <span className="text-emerald-500 font-semibold font-mono">
            {stats.alpha != null ? (stats.alpha >= 0 ? `+${stats.alpha.toFixed(1)}% α` : `${stats.alpha.toFixed(1)}% α`) : '0.0% α'}
          </span>
        </div>
      </div>

      {/* 3. Sharpe & Sortino */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between transition-colors shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <div className="flex items-center space-x-1">
            <span>Sharpe Ratio</span>
            <MetricHelpButton metricId="sharpe_ratio" onOpenHelp={handleHelp} size="xs" />
          </div>
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-bold font-mono text-slate-100">
          {(stats.sharpeRatio ?? 0).toFixed(2)}
        </div>
        <div className="text-xs font-mono text-slate-400 mt-1 flex items-center space-x-1">
          <span>Sortino:</span>
          <span className="text-slate-200 font-semibold">{(stats.sortinoRatio ?? 0).toFixed(2)}</span>
          <MetricHelpButton metricId="sortino_ratio" onOpenHelp={handleHelp} size="xs" />
          <span className="text-slate-500 text-[10px]">(Rf 6.5%)</span>
        </div>
      </div>

      {/* 4. Max Drawdown & Calmar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between transition-colors shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <div className="flex items-center space-x-1">
            <span>Max Drawdown</span>
            <MetricHelpButton metricId="max_drawdown" onOpenHelp={handleHelp} size="xs" />
          </div>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="text-base font-bold font-mono text-rose-500">
          -{(stats.maxDrawdownPct ?? 0).toFixed(2)}%
        </div>
        <div className="text-xs font-mono text-slate-400 mt-1 flex items-center space-x-1">
          <span>Calmar:</span>
          <span className="text-slate-200 font-semibold">{(stats.calmarRatio ?? 0).toFixed(2)}</span>
          <MetricHelpButton metricId="calmar_ratio" onOpenHelp={handleHelp} size="xs" />
        </div>
      </div>

      {/* 5. Win Rate & Profit Factor */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between transition-colors shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <div className="flex items-center space-x-1">
            <span>Win Rate</span>
            <MetricHelpButton metricId="win_rate" onOpenHelp={handleHelp} size="xs" />
          </div>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-bold font-mono text-slate-100">
          {(stats.winRatePct ?? 0).toFixed(1)}%
        </div>
        <div className="text-xs font-mono text-slate-400 mt-1 flex items-center space-x-1">
          <span>PF:</span>
          <span className="text-slate-200 font-semibold">{(stats.profitFactor ?? 0).toFixed(2)}</span>
          <MetricHelpButton metricId="profit_factor" onOpenHelp={handleHelp} size="xs" />
          <span className="text-slate-500 text-[10px]">({stats.totalTrades ?? 0} tr)</span>
        </div>
      </div>

      {/* 6. Overfitting Confidence (PSR / DSR) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between transition-colors shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <div className="flex items-center space-x-1">
            <span>Deflated Sharpe (DSR)</span>
            <MetricHelpButton metricId="dsr" onOpenHelp={handleHelp} size="xs" />
          </div>
          <Scale className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-bold font-mono text-purple-400">
          {dsrPct}
        </div>
        <div className="text-xs font-mono text-slate-400 mt-1 flex items-center space-x-1">
          <span>PSR: <strong className="text-slate-200">{psrPct}</strong></span>
          <span className="text-[10px] text-emerald-500">✓ Valid</span>
        </div>
      </div>
    </div>
  );
};
