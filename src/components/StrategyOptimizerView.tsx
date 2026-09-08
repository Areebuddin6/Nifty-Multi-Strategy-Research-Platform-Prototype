import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Play, 
  RefreshCw, 
  Sparkles, 
  Sliders, 
  TrendingUp, 
  ShieldAlert, 
  Percent, 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Compass, 
  Zap, 
  HelpCircle,
  Clock,
  Layers,
  IndianRupee,
  Activity,
  Filter
} from 'lucide-react';
import { 
  StrategyConfig, 
  StrategyType, 
  IndexUniverse, 
  ThemeMode 
} from '../types';
import { 
  runStrategyOptimizerSweep, 
  OptimizationResult, 
  OptimizationObjective, 
  OptimizerFilterOptions 
} from '../engine/strategyOptimizer';
import { MetricHelpButton } from './MetricHelpButton';

interface StrategyOptimizerViewProps {
  currentConfig: StrategyConfig;
  onApplyOptimizedStrategy: (candidate: OptimizationResult['candidate']) => void;
  isSimpleMode: boolean;
  theme: ThemeMode;
  onOpenHelp?: (section?: any, topicId?: string) => void;
  onOpenMetricHelp?: (metricId: string) => void;
}

export const StrategyOptimizerView: React.FC<StrategyOptimizerViewProps> = ({
  currentConfig,
  onApplyOptimizedStrategy,
  isSimpleMode,
  theme,
  onOpenHelp,
  onOpenMetricHelp,
}) => {
  const [objective, setObjective] = useState<OptimizationObjective>('quant_score');
  const [universe, setUniverse] = useState<IndexUniverse>(currentConfig.universe || 'NIFTY_50');
  const [maxDrawdownLimit, setMaxDrawdownLimit] = useState<number | undefined>(undefined);
  const [minTradesLimit, setMinTradesLimit] = useState<number | undefined>(15);
  const [sweepDepth, setSweepDepth] = useState<'standard' | 'deep'>('standard');
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [sweepProgress, setSweepProgress] = useState<number>(0);
  const [currentScanningName, setCurrentScanningName] = useState<string>('');
  const [expandedRank, setExpandedRank] = useState<number | null>(null);

  const handleHelp = (metricId: string) => {
    if (onOpenMetricHelp) {
      onOpenMetricHelp(metricId);
    } else if (onOpenHelp) {
      onOpenHelp('metrics', metricId);
    }
  };

  // Initial sweep results
  const [results, setResults] = useState<OptimizationResult[]>(() => {
    return runStrategyOptimizerSweep({
      objective: 'quant_score',
      universe: currentConfig.universe || 'NIFTY_50',
      sweepDepth: 'standard',
    });
  });

  const topPerformer = results[0];

  const handleRunOptimizer = () => {
    setIsSweeping(true);
    setSweepProgress(10);
    setCurrentScanningName('Initializing multi-strategy parameter grid...');

    setTimeout(() => {
      const filterOptions: OptimizerFilterOptions = {
        objective,
        universe,
        maxDrawdownLimitPct: maxDrawdownLimit,
        minTradesLimit: minTradesLimit,
        sweepDepth,
      };

      const newResults = runStrategyOptimizerSweep(filterOptions, (pct, name) => {
        setSweepProgress(pct);
        setCurrentScanningName(name);
      });

      setResults(newResults);
      setIsSweeping(false);
      setSweepProgress(100);
      setExpandedRank(null);
    }, 300);
  };

  // Re-sort existing or run if objective changes
  const handleObjectiveChange = (newObj: OptimizationObjective) => {
    setObjective(newObj);
    setIsSweeping(true);
    setTimeout(() => {
      const newResults = runStrategyOptimizerSweep({
        objective: newObj,
        universe,
        maxDrawdownLimitPct: maxDrawdownLimit,
        minTradesLimit: minTradesLimit,
        sweepDepth,
      });
      setResults(newResults);
      setIsSweeping(false);
    }, 150);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Feature Context */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Award className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                {isSimpleMode 
                  ? 'Retail Strategy Discovery & Top Performer Finder' 
                  : 'Quantitative Strategy Optimizer & Parameter Grid Screener'}
              </h2>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
                {results.length} Param Permutations
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Systematically evaluates multiple retail trading strategies across variable lookback periods, 
              entry thresholds, and risk variations. Uses strict quantitative standards (Sharpe, Calmar, DSR, 
              Max Drawdown, and Indian statutory friction drag) to identify the mathematically dominant strategy with comprehensive reasoning.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              id="btn-run-optimizer-sweep"
              onClick={handleRunOptimizer}
              disabled={isSweeping}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSweeping ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Analyzing {sweepProgress}%...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Multi-Strategy Sweep</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar when running */}
        {isSweeping && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
              <span>Scanning: {currentScanningName || 'Evaluating parameter combinations...'}</span>
              <span className="text-emerald-400 font-bold">{sweepProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(5, sweepProgress)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Control Filters & Constraints */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Optimization Goal &amp; Strict Quant Constraints</span>
          </div>
          <span className="text-xs text-slate-400">
            Both automated screening &amp; manual control preserved
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Optimization Goal */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Rank &amp; Target Goal:
            </label>
            <select
              value={objective}
              onChange={(e) => handleObjectiveChange(e.target.value as OptimizationObjective)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="quant_score">🏆 Best Overall Quant Score (Balanced)</option>
              <option value="sharpe">📈 Highest Sharpe Ratio (Risk-Adjusted)</option>
              <option value="calmar">⚖️ Best Calmar Ratio (CAGR vs Drawdown)</option>
              <option value="min_drawdown">🛡️ Lowest Max Drawdown (Capital Defense)</option>
              <option value="max_cagr">🚀 Maximum CAGR (%) (Growth Maximizer)</option>
              <option value="win_rate">🎯 Highest Win Rate (Psychological Comfort)</option>
              <option value="tax_efficiency">💰 Best Tax &amp; Friction Efficiency</option>
            </select>
          </div>

          {/* Universe */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Target Stock Universe:
            </label>
            <select
              value={universe}
              onChange={(e) => setUniverse(e.target.value as IndexUniverse)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="NIFTY_50">Nifty 50 Bluechips (High Liquidity)</option>
              <option value="NIFTY_100">Nifty 100 (Bluechip + Emerging Large)</option>
              <option value="NIFTY_250">Nifty 250 (Mid-Cap Exposure)</option>
              <option value="NIFTY_500">Nifty 500 (Broad Market)</option>
            </select>
          </div>

          {/* Max Drawdown Tolerance Constraint */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Max Drawdown Constraint:
            </label>
            <select
              value={maxDrawdownLimit === undefined ? 'any' : maxDrawdownLimit.toString()}
              onChange={(e) => setMaxDrawdownLimit(e.target.value === 'any' ? undefined : Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="any">No Hard Ceiling (All Results)</option>
              <option value="10">Strict: Max Drawdown &le; 10%</option>
              <option value="15">Moderate: Max Drawdown &le; 15%</option>
              <option value="20">Tolerant: Max Drawdown &le; 20%</option>
            </select>
          </div>

          {/* Sweep Depth */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Parameter Sweep Depth:
            </label>
            <div className="flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSweepDepth('standard')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                  sweepDepth === 'standard'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Standard (24)
              </button>
              <button
                type="button"
                onClick={() => setSweepDepth('deep')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                  sweepDepth === 'deep'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Deep Grid (64)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* THE #1 OVERALL CHAMPION SPOTLIGHT */}
      {topPerformer && (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-2xl shadow-emerald-950/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold text-lg shadow-sm">
                👑 #1
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-extrabold text-slate-100 tracking-tight">
                    {topPerformer.candidate.strategyName}
                  </h3>
                  <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono">
                    {topPerformer.candidate.variation} MODE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Category: <strong className="text-slate-300">{topPerformer.candidate.category}</strong> • Universe: <strong className="text-slate-300">{topPerformer.candidate.universe}</strong>
                </p>
              </div>
            </div>

            {/* Crucial Action: Transfer to Manual Backtester */}
            <button
              id="btn-load-champion-strategy"
              onClick={() => onApplyOptimizedStrategy(topPerformer.candidate)}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-emerald-500/25 cursor-pointer transform hover:-translate-y-0.5"
              title="Transfers these exact parameters into the manual controls panel and opens backtest results"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Load into Manual Backtester</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Winning Parameters Badge Bar */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2 text-slate-400">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-semibold font-sans">Optimal Winning Parameters:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-slate-200">
                Lookback: <strong className="text-emerald-400">{topPerformer.candidate.lookbackDays} Days</strong>
              </span>
              <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-slate-200">
                Entry Trigger: <strong className="text-emerald-400">Z &ge; {topPerformer.candidate.entryZScore}</strong>
              </span>
              <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-slate-200">
                Stop Loss: <strong className="text-amber-400">Z &le; {topPerformer.candidate.stopLossZScore}</strong>
              </span>
              <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-slate-200 inline-flex items-center space-x-1">
                <span>Avg Hold: <strong className="text-indigo-400">{topPerformer.avgHoldingDays} Days</strong></span>
                <MetricHelpButton metricId="avg_holding_days" onOpenHelp={handleHelp} size="xs" />
              </span>
            </div>
          </div>

          {/* Strict Quant Metrics Scorecard */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span>Quant Score</span>
                  <MetricHelpButton metricId="quant_score" onOpenHelp={handleHelp} size="xs" />
                </div>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">
                {topPerformer.compositeQuantScore}
                <span className="text-xs text-slate-500 font-normal"> /100</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Multi-factor composite</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span>Annual CAGR</span>
                  <MetricHelpButton metricId="cagr" onOpenHelp={handleHelp} size="xs" />
                </div>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                +{topPerformer.cagrPct}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Net after delivery taxes</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span>Sharpe Ratio</span>
                  <MetricHelpButton metricId="sharpe_ratio" onOpenHelp={handleHelp} size="xs" />
                </div>
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-100 font-mono">
                {topPerformer.sharpeRatio}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1">
                <span>Sortino: {topPerformer.sortinoRatio}</span>
                <MetricHelpButton metricId="sortino_ratio" onOpenHelp={handleHelp} size="xs" />
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span>Max Drawdown</span>
                  <MetricHelpButton metricId="max_drawdown" onOpenHelp={handleHelp} size="xs" />
                </div>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">
                -{topPerformer.maxDrawdownPct}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1">
                <span>Calmar: {topPerformer.calmarRatio}</span>
                <MetricHelpButton metricId="calmar_ratio" onOpenHelp={handleHelp} size="xs" />
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span>Win Rate</span>
                  <MetricHelpButton metricId="win_rate" onOpenHelp={handleHelp} size="xs" />
                </div>
                <Percent className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="text-2xl font-extrabold text-teal-300 font-mono">
                {topPerformer.winRatePct}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">{topPerformer.totalTrades} closed trades</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span>DSR Overfit Conf.</span>
                  <MetricHelpButton metricId="dsr" onOpenHelp={handleHelp} size="xs" />
                </div>
                <Award className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-300 font-mono">
                {topPerformer.dsrConfidencePct}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Deflated Sharpe test</div>
            </div>
          </div>

          {/* Deep Reasoning & Educational Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Box 1: What is the strategy */}
            <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <Compass className="w-4 h-4" />
                <span>What Is This Strategy? (System Mechanics)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {topPerformer.strategySummary}
              </p>
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 font-mono text-[11px]">
                <div className="text-slate-400">
                  <strong className="text-slate-200">Indicator Setup:</strong> {topPerformer.indicatorSetup}
                </div>
                <div className="text-slate-400">
                  <strong className="text-slate-200">Entry Rule:</strong> {topPerformer.entryRule}
                </div>
                <div className="text-slate-400">
                  <strong className="text-slate-200">Exit / Stop:</strong> {topPerformer.exitRule}
                </div>
              </div>
            </div>

            {/* Box 2: Why it is the best */}
            <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Why It Ranked #1: Quantitative Rationale</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {topPerformer.whyRanked}
              </p>
              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <div className="font-semibold text-slate-200 text-[11px] mb-1">Key Statistical Strengths:</div>
                {topPerformer.quantStrengths.map((str, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5 text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 3: Market Regime */}
            <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                <Activity className="w-4 h-4" />
                <span>Market Regime Suitability &amp; Risk Defense</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {topPerformer.marketRegimeSuitability}
              </p>
              <div className="bg-rose-950/30 border border-rose-900/40 rounded-xl p-2.5 text-rose-300 text-[11px] flex items-start space-x-2 mt-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Key Risk Factor:</strong> {topPerformer.riskWatchout}
                </div>
              </div>
            </div>

            {/* Box 4: Retail Execution Guide */}
            <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-teal-400 font-bold text-sm">
                <IndianRupee className="w-4 h-4" />
                <span>Retail Execution Guide (Zerodha / NSE)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {topPerformer.retailExecutionTakeaway}
              </p>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-slate-400 font-mono text-[11px] space-y-1.5">
                <div className="flex items-center space-x-1">
                  <span>Total Friction Paid: <strong className="text-amber-400">₹{(topPerformer.totalCosts.total || 0).toLocaleString('en-IN')}</strong> ({topPerformer.costDragPct}% of initial capital)</span>
                  <MetricHelpButton metricId="cost_drag" onOpenHelp={handleHelp} size="xs" />
                </div>
                <div className="flex items-center space-x-1">
                  <span>Statutory Tax Drag: <strong className="text-slate-200">{topPerformer.costToProfitRatioPct}%</strong> of gross profits absorbed by STT &amp; SEBI</span>
                  <MetricHelpButton metricId="cost_to_profit" onOpenHelp={handleHelp} size="xs" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RANKED TOP PERFORMING STRATEGIES LEADERBOARD */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Full Ranked Strategy Leaderboard ({results.length} Candidates)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked dynamically by chosen objective. Click any row to expand the detailed quant rationale, or click "Load &amp; Test" to experiment manually.
            </p>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Filtered by: <span className="text-emerald-400 font-semibold">{objective.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Strategy &amp; Mode</th>
                <th className="py-3.5 px-4">Params (Lookback/Z)</th>
                <th className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center space-x-1 justify-end">
                    <span>CAGR</span>
                    <MetricHelpButton metricId="cagr" onOpenHelp={handleHelp} size="xs" />
                  </span>
                </th>
                <th className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center space-x-1 justify-end">
                    <span>Sharpe</span>
                    <MetricHelpButton metricId="sharpe_ratio" onOpenHelp={handleHelp} size="xs" />
                  </span>
                </th>
                <th className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center space-x-1 justify-end">
                    <span>Max DD</span>
                    <MetricHelpButton metricId="max_drawdown" onOpenHelp={handleHelp} size="xs" />
                  </span>
                </th>
                <th className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center space-x-1 justify-end">
                    <span>Calmar</span>
                    <MetricHelpButton metricId="calmar_ratio" onOpenHelp={handleHelp} size="xs" />
                  </span>
                </th>
                <th className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center space-x-1 justify-end">
                    <span>Win Rate</span>
                    <MetricHelpButton metricId="win_rate" onOpenHelp={handleHelp} size="xs" />
                  </span>
                </th>
                <th className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center space-x-1 justify-end">
                    <span>Quant Score</span>
                    <MetricHelpButton metricId="quant_score" onOpenHelp={handleHelp} size="xs" />
                  </span>
                </th>
                <th className="py-3.5 px-4 text-center">Manual Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {results.slice(0, 15).map((row) => {
                const isExpanded = expandedRank === row.rank;
                const isTop1 = row.rank === 1;

                return (
                  <React.Fragment key={`${row.candidate.strategyId}_${row.candidate.variation}_${row.candidate.lookbackDays}_${row.candidate.entryZScore}_${row.rank}`}>
                    <tr 
                      onClick={() => setExpandedRank(isExpanded ? null : row.rank)}
                      className={`hover:bg-slate-850/60 transition cursor-pointer ${
                        isTop1 ? 'bg-emerald-950/20 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                          row.rank === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          row.rank === 2 ? 'bg-slate-300/20 text-slate-200 border border-slate-400/30' :
                          row.rank === 3 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {row.rank}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                          <span>{row.candidate.strategyName}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase ${
                            row.candidate.variation === 'conservative' ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800' :
                            row.candidate.variation === 'aggressive' ? 'bg-amber-950/80 text-amber-300 border border-amber-800' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {row.candidate.variation}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {row.candidate.category}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {row.candidate.lookbackDays}d &bull; Z&ge;{row.candidate.entryZScore}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        +{row.cagrPct}%
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-200">
                        {row.sharpeRatio}
                      </td>

                      <td className="py-3.5 px-4 text-right text-rose-400 font-semibold">
                        -{row.maxDrawdownPct}%
                      </td>

                      <td className="py-3.5 px-4 text-right text-indigo-300">
                        {row.calmarRatio}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-300">
                        {row.winRatePct}%
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          row.compositeQuantScore >= 85 ? 'bg-emerald-500/20 text-emerald-300' :
                          row.compositeQuantScore >= 70 ? 'bg-amber-500/20 text-amber-300' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {row.compositeQuantScore}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onApplyOptimizedStrategy(row.candidate)}
                          className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition cursor-pointer inline-flex items-center space-x-1"
                          title="Load this strategy and parameters into the manual tester"
                        >
                          <span>Load</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Explanation Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-950/90 border-b border-slate-800">
                        <td colSpan={10} className="p-5 font-sans">
                          <div className="space-y-3 bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <div className="flex items-center space-x-2">
                                <Info className="w-4 h-4 text-emerald-400" />
                                <span className="font-bold text-slate-100 text-sm">
                                  Quantitative Rationale &amp; Strategy Rules (Rank #{row.rank})
                                </span>
                              </div>
                              <button
                                onClick={() => onApplyOptimizedStrategy(row.candidate)}
                                className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
                              >
                                Load Parameters &amp; Test Manually &rarr;
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div>
                                <div className="font-semibold text-slate-200 mb-1">What is this Strategy?</div>
                                <p className="text-slate-400 leading-relaxed">{row.strategySummary}</p>
                                <div className="mt-2 text-slate-400 space-y-0.5 font-mono text-[11px]">
                                  <div><strong>Entry:</strong> {row.entryRule}</div>
                                  <div><strong>Exit:</strong> {row.exitRule}</div>
                                </div>
                              </div>

                              <div>
                                <div className="font-semibold text-slate-200 mb-1">Why Did It Achieve This Rank?</div>
                                <p className="text-slate-400 leading-relaxed">{row.whyRanked}</p>
                                <div className="mt-2 text-slate-400 space-y-0.5 font-mono text-[11px]">
                                  <div><strong>Indian Taxes Paid:</strong> ₹{(row.totalCosts.total || 0).toLocaleString('en-IN')} ({row.costToProfitRatioPct}% of profits)</div>
                                  <div><strong>Overfitting DSR:</strong> {row.dsrConfidencePct}% confidence</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
