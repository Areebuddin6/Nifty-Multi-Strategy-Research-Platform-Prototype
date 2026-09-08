import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  Activity, 
  IndianRupee, 
  ArrowRight, 
  CheckCircle2, 
  Sliders, 
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  Scale,
  Zap,
  RefreshCw,
  Percent,
  Calendar
} from 'lucide-react';
import { 
  OptimizationResult, 
  OptimizationObjective, 
  OptimizerFilterOptions, 
  runStrategyOptimizerSweep 
} from '../engine/strategyOptimizer';
import { StrategyConfig, StrategyType, StrategyVariation, IndexUniverse } from '../types';
import { MetricHelpButton } from './MetricHelpButton';

interface StrategyOptimizerViewProps {
  onSelectAndApplyStrategy: (
    strat: StrategyType, 
    variation: StrategyVariation, 
    lookbackDays: number,
    startDate?: string,
    endDate?: string
  ) => void;
  onOpenMetricHelp: (metricId: string) => void;
  isSimpleMode?: boolean;
  initialStartDate?: string;
  initialEndDate?: string;
}

export const StrategyOptimizerView: React.FC<StrategyOptimizerViewProps> = ({
  onSelectAndApplyStrategy,
  onOpenMetricHelp,
  isSimpleMode = false,
  initialStartDate = '2020-01-01',
  initialEndDate = '2026-08-31',
}) => {
  // Optimizer Filter & Objective States (Search & Discovery only - NO strategy engine config!)
  const [objective, setObjective] = useState<OptimizationObjective>('quant_score');
  const [universe, setUniverse] = useState<IndexUniverse>('nifty_50');
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);
  const [maxDrawdownLimit, setMaxDrawdownLimit] = useState<number | undefined>(undefined);
  const [sweepDepth, setSweepDepth] = useState<'standard' | 'deep'>('standard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Execution & Progress state
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [sweepProgress, setSweepProgress] = useState<number>(100);
  const [currentSweepLabel, setCurrentSweepLabel] = useState<string>('');
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [expandedRank, setExpandedRank] = useState<number | null>(1); // Top 1 open by default

  // Run optimization sweep
  const handleRunOptimization = () => {
    setIsSweeping(true);
    setSweepProgress(10);
    setCurrentSweepLabel('Initializing parameter permutations...');

    setTimeout(() => {
      const opts: OptimizerFilterOptions = {
        objective,
        universe,
        startDate,
        endDate,
        maxDrawdownLimitPct: maxDrawdownLimit,
        sweepDepth,
      };

      const sweepResults = runStrategyOptimizerSweep(opts, (pct, stratName) => {
        setSweepProgress(pct);
        setCurrentSweepLabel(stratName);
      });

      setResults(sweepResults);
      setIsSweeping(false);
      setSweepProgress(100);
      if (sweepResults.length > 0) {
        setExpandedRank(sweepResults[0].rank);
      }
    }, 400);
  };

  // Run on mount once
  useEffect(() => {
    const opts: OptimizerFilterOptions = {
      objective: 'quant_score',
      universe: 'nifty_50',
      sweepDepth: 'standard',
      startDate,
      endDate,
    };
    const initial = runStrategyOptimizerSweep(opts);
    setResults(initial);
  }, []);

  // Filtered by search query
  const filteredResults = results.filter(r => 
    r.candidate.strategyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.candidate.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.candidate.variation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getObjectiveLabel = (obj: OptimizationObjective) => {
    switch (obj) {
      case 'quant_score': return 'Composite Quant Score (Balanced)';
      case 'sharpe': return 'Maximum Sharpe Ratio';
      case 'calmar': return 'Calmar Ratio (CAGR ÷ Max DD)';
      case 'min_drawdown': return 'Lowest Max Drawdown (Capital Preservation)';
      case 'max_cagr': return 'Maximum CAGR Growth';
      case 'win_rate': return 'Highest Win Rate %';
      case 'tax_efficiency': return 'Highest Tax & Friction Efficiency';
    }
  };

  const getBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30';
    if (rank === 2) return 'bg-slate-300/20 text-slate-200 border-slate-400/40';
    if (rank === 3) return 'bg-amber-700/20 text-amber-400 border-amber-700/40';
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Discovery Control Bar (Purely Discovery & Sorting, NOT Engine Config) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-semibold uppercase tracking-wider text-amber-500">
                Strategy Optimization &amp; Model Screener
              </span>
              <span>•</span>
              <span>Multi-Factor Frontier</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Optimal Strategy Discovery &amp; Quantitative Ranking
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Sweeps and tests mathematical parameter permutations across all systematic trading models. Ranks candidates using strict econometric formulas, statutory tax friction, and Deflated Sharpe overfitting tests.
            </p>
          </div>

          {/* Action Trigger */}
          <button
            id="btn-run-optimization-sweep"
            onClick={handleRunOptimization}
            disabled={isSweeping}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSweeping ? 'animate-spin' : ''}`} />
            <span>{isSweeping ? 'Sweeping Parameter Grid...' : 'Run Optimization Sweep'}</span>
          </button>
        </div>

        {/* Screener & Optimization Criteria (Clean, Objective Controls Only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 text-xs">
          {/* Optimization Goal */}
          <div>
            <label className="text-slate-400 font-semibold block mb-1.5 flex items-center justify-between">
              <span>Optimization Target</span>
              <MetricHelpButton metricId="quant_score" onOpenHelp={onOpenMetricHelp} size="xs" />
            </label>
            <select
              id="select-optimizer-objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value as OptimizationObjective)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="quant_score">Composite Quant Score (Recommended)</option>
              <option value="sharpe">Maximum Sharpe Ratio (Rf 6.5%)</option>
              <option value="calmar">Calmar Ratio (Return ÷ Drawdown)</option>
              <option value="min_drawdown">Lowest Max Drawdown (Capital Safety)</option>
              <option value="max_cagr">Maximum Compounded CAGR</option>
              <option value="win_rate">Highest Win Rate %</option>
              <option value="tax_efficiency">Highest Indian Tax Efficiency</option>
            </select>
          </div>

          {/* Universe */}
          <div>
            <label className="text-slate-400 font-semibold block mb-1.5">NSE Stock Universe</label>
            <select
              id="select-optimizer-universe"
              value={universe}
              onChange={(e) => setUniverse(e.target.value as IndexUniverse)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <optgroup label="Broad Market Indices">
                <option value="NIFTY_50">NIFTY 50 Bluechips (High Liquidity)</option>
                <option value="NIFTY_NEXT_50">NIFTY NEXT 50 (Large Cap Growth)</option>
                <option value="NIFTY_100">NIFTY 100 (Top 100 Largecaps)</option>
                <option value="NIFTY_200">NIFTY 200 (Top 200 Large & Mid)</option>
                <option value="NIFTY_500">NIFTY 500 (Complete 500 Market Universe)</option>
              </optgroup>
              <optgroup label="Midcap Indices">
                <option value="NIFTY_MIDCAP_50">NIFTY MIDCAP 50 (High Beta 50)</option>
                <option value="NIFTY_MIDCAP_100">NIFTY MIDCAP 100</option>
                <option value="NIFTY_MIDCAP_150">NIFTY MIDCAP 150 (Rank 101-250)</option>
              </optgroup>
              <optgroup label="Smallcap Indices">
                <option value="NIFTY_SMALLCAP_50">NIFTY SMALLCAP 50 (Growth 50)</option>
                <option value="NIFTY_SMALLCAP_100">NIFTY SMALLCAP 100</option>
                <option value="NIFTY_SMALLCAP_250">NIFTY SMALLCAP 250 (Rank 251-500)</option>
              </optgroup>
              <optgroup label="Sectoral Benchmarks">
                <option value="NIFTY_BANK">NIFTY BANK (Private & PSU Banks)</option>
                <option value="NIFTY_IT">NIFTY IT (Technology Leaders)</option>
                <option value="NIFTY_AUTO">NIFTY AUTO (OEMs & Auto Ancillaries)</option>
                <option value="NIFTY_PHARMA">NIFTY PHARMA (Healthcare & Formulations)</option>
                <option value="NIFTY_FMCG">NIFTY FMCG (Consumer Goods)</option>
                <option value="NIFTY_METAL">NIFTY METAL (Steel & Smelters)</option>
                <option value="NIFTY_ENERGY">NIFTY ENERGY (Utilities & Oil)</option>
              </optgroup>
            </select>
          </div>

          {/* Max Drawdown Ceiling */}
          <div>
            <label className="text-slate-400 font-semibold block mb-1.5 flex items-center justify-between">
              <span>Max Drawdown Ceiling</span>
              <MetricHelpButton metricId="max_drawdown" onOpenHelp={onOpenMetricHelp} size="xs" />
            </label>
            <select
              id="select-optimizer-maxdd"
              value={maxDrawdownLimit === undefined ? 'none' : maxDrawdownLimit}
              onChange={(e) => {
                const val = e.target.value;
                setMaxDrawdownLimit(val === 'none' ? undefined : Number(val));
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="none">No Filter (Include All)</option>
              <option value="12">Strict: Max Drawdown &lt; 12%</option>
              <option value="16">Moderate: Max Drawdown &lt; 16%</option>
              <option value="20">Permissive: Max Drawdown &lt; 20%</option>
            </select>
          </div>

          {/* Sweep Depth */}
          <div>
            <label className="text-slate-400 font-semibold block mb-1.5">Permutation Depth</label>
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setSweepDepth('standard')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  sweepDepth === 'standard' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Standard (24 Grids)
              </button>
              <button
                type="button"
                onClick={() => setSweepDepth('deep')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  sweepDepth === 'deep' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Deep (64 Grids)
              </button>
            </div>
          </div>
        </div>

        {/* Historical Optimization Horizon & Macro Stress Regimes Selector */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">Historical Optimization Horizon:</span>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                {startDate} → {endDate} (
                {((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)} Years)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Discovers models resilient across long-term market regimes (crashes, consolidation &amp; bull runs)
            </span>
          </div>

          {/* Quick Horizon Presets & Custom Horizon */}
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              { label: '30 Years (1996–2026)', start: '1996-01-01', end: '2026-08-31', badge: 'Full NSE History' },
              { label: '20 Years (2006–2026)', start: '2006-01-01', end: '2026-08-31', badge: 'Includes GFC' },
              { label: '10 Years (2016–2026)', start: '2016-01-01', end: '2026-08-31', badge: 'DeMon & COVID' },
              { label: '5 Years (2020–2026)', start: '2020-01-01', end: '2026-08-31', badge: 'COVID Supercycle' },
              { label: '3 Years (2023–2026)', start: '2023-01-01', end: '2026-08-31', badge: 'High-Rate Regime' },
            ].map((preset) => {
              const isSelected = startDate === preset.start && endDate === preset.end;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setStartDate(preset.start);
                    setEndDate(preset.end);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium flex items-center space-x-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold shadow-xs'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span>{preset.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition-colors ${
                      isSelected
                        ? 'bg-amber-500/25 text-amber-200 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    {preset.badge}
                  </span>
                </button>
              );
            })}

            {/* Dedicated Custom Horizon Selector */}
            {(() => {
              const isPreset = [
                { start: '1996-01-01', end: '2026-08-31' },
                { start: '2006-01-01', end: '2026-08-31' },
                { start: '2016-01-01', end: '2026-08-31' },
                { start: '2020-01-01', end: '2026-08-31' },
                { start: '2023-01-01', end: '2026-08-31' },
              ].some((p) => startDate === p.start && endDate === p.end);
              const isCustom = !isPreset;

              return (
                <button
                  type="button"
                  id="custom-optimizer-horizon-button"
                  onClick={() => {
                    document.getElementById('opt-start-date')?.focus();
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium flex items-center space-x-1.5 cursor-pointer ${
                    isCustom
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold shadow-xs'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span>Custom Horizon</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition-colors ${
                      isCustom
                        ? 'bg-amber-500/25 text-amber-200 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    {isCustom ? 'Active' : 'Custom Dates'}
                  </span>
                </button>
              );
            })()}
          </div>

          {/* Date Inputs for Custom Horizon & Active Macro Stress Regimes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs shadow-sm">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold text-[11px] uppercase tracking-wider">Optimization Start Date</label>
              <input
                id="opt-start-date"
                type="date"
                value={startDate}
                min="1996-01-01"
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500 font-mono text-xs shadow-xs transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-semibold text-[11px] uppercase tracking-wider">Optimization End Date</label>
              <input
                id="opt-end-date"
                type="date"
                value={endDate}
                min={startDate}
                max="2026-12-31"
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500 font-mono text-xs shadow-xs transition-colors"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col justify-center">
              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-1.5 block">
                Macro Stress Regimes Tested:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: '2000 Dot-Com (-50%)', from: 2000, to: 2002 },
                  { name: '2003-07 Capex Bull', from: 2003, to: 2007 },
                  { name: '2008 Lehman GFC (-60%)', from: 2008, to: 2009 },
                  { name: '2013 Taper Tantrum', from: 2013, to: 2013 },
                  { name: '2016 DeMon', from: 2016, to: 2016 },
                  { name: '2020 COVID (-38%)', from: 2020, to: 2020 },
                  { name: '2021-26 SIP Boom', from: 2021, to: 2026 },
                ].map((regime) => {
                  const startYr = parseInt(startDate.slice(0, 4)) || 2020;
                  const endYr = parseInt(endDate.slice(0, 4)) || 2026;
                  const isActive = startYr <= regime.to && endYr >= regime.from;
                  return (
                    <span
                      key={regime.name}
                      className={`text-[10px] px-2.5 py-0.5 rounded-md border font-semibold transition-colors ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-2xs'
                          : 'bg-slate-800/80 border-slate-700/60 text-slate-400 font-medium'
                      }`}
                    >
                      {regime.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Live Sweeping Progress Indicator */}
        {isSweeping && (
          <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-amber-500/30 space-y-2">
            <div className="flex justify-between text-xs text-amber-400 font-semibold">
              <span className="flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating: {currentSweepLabel}</span>
              </span>
              <span className="font-mono">{sweepProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-full transition-all duration-200 rounded-full" 
                style={{ width: `${sweepProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Results Header and Quick Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-bold text-slate-200">
            Top Ranked Combinations ({filteredResults.length} Models Screened)
          </h3>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
            Sorted by: {getObjectiveLabel(objective)}
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search ranked strategies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* 3. Ranked Strategy Cards with Deep Explanations */}
      <div className="space-y-4">
        {filteredResults.map((res) => {
          const isExpanded = expandedRank === res.rank;
          const isTop1 = res.rank === 1;

          return (
            <div
              key={`${res.candidate.strategyId}-${res.candidate.variation}-${res.candidate.lookbackDays}-${res.candidate.entryZScore}`}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isTop1 
                  ? 'bg-slate-900 border-amber-500/50 shadow-lg ring-1 ring-amber-500/20'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header Summary Banner */}
              <div 
                className="p-4 sm:p-5 cursor-pointer select-none transition-colors"
                onClick={() => setExpandedRank(isExpanded ? null : res.rank)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-6">
                  {/* Left: Rank & Strategy Meta Information */}
                  <div className="flex items-start sm:items-center justify-between gap-3 min-w-0 flex-1">
                    <div className="flex items-start sm:items-center space-x-3.5 min-w-0 flex-1">
                      {/* Rank Badge */}
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center font-mono font-extrabold text-sm shrink-0 ${getBadgeColor(res.rank)}`}>
                        #{res.rank}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h3 className="text-base font-bold text-white hover:text-amber-400 transition truncate max-w-sm sm:max-w-md lg:max-w-none">
                            {res.candidate.strategyName}
                          </h3>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                            {res.candidate.variation}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 shrink-0">
                            {res.candidate.lookbackDays}d Window
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400/90 border border-amber-500/20 shrink-0">
                            {startDate.slice(0, 4)}–{endDate.slice(0, 4)} Horizon
                          </span>
                          {isTop1 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                              ★ Best Overall Score
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          {res.strategySummary}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Chevron toggle (visible on mobile < lg) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedRank(isExpanded ? null : res.rank);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition lg:hidden shrink-0"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Right: Key Metrics Snapshot - Column-aligned on desktop, evenly spaced on mobile */}
                  <div className="flex items-center justify-between lg:justify-end gap-2 sm:gap-4 lg:gap-6 border-t border-slate-800/80 pt-3 lg:border-t-0 lg:pt-0 shrink-0 font-mono text-xs">
                    <div className="text-center lg:text-right min-w-[4.5rem]">
                      <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold truncate">
                        Quant Score
                      </span>
                      <span className="text-sm font-bold text-amber-400">
                        {res.compositeQuantScore}/100
                      </span>
                    </div>

                    <div className="text-center lg:text-right min-w-[4rem]">
                      <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold truncate">
                        CAGR
                      </span>
                      <span className="text-sm font-bold text-emerald-400">
                        +{res.cagrPct}%
                      </span>
                    </div>

                    <div className="text-center lg:text-right min-w-[3.75rem]">
                      <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold truncate">
                        Sharpe
                      </span>
                      <span className="text-sm font-bold text-cyan-400">
                        {res.sharpeRatio.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-center lg:text-right min-w-[3.75rem]">
                      <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold truncate">
                        Max DD
                      </span>
                      <span className="text-sm font-bold text-rose-400">
                        -{res.maxDrawdownPct}%
                      </span>
                    </div>

                    {/* Desktop Chevron toggle (visible on lg and up) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedRank(isExpanded ? null : res.rank);
                      }}
                      className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0 ml-1"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Detailed Audit, Strengths & Strategy Explanation */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
                  {/* Detailed Metric Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono">
                    <div className="p-2 bg-slate-900/60 rounded-lg">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                        <span>Calmar Ratio</span>
                        <MetricHelpButton metricId="calmar_ratio" onOpenHelp={onOpenMetricHelp} size="xs" />
                      </div>
                      <span className="text-sm font-bold text-slate-200 mt-1 block">
                        {res.calmarRatio.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-900/60 rounded-lg">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                        <span>Win Rate</span>
                        <MetricHelpButton metricId="win_rate" onOpenHelp={onOpenMetricHelp} size="xs" />
                      </div>
                      <span className="text-sm font-bold text-emerald-400 mt-1 block">
                        {res.winRatePct}% ({res.totalTrades} tr)
                      </span>
                    </div>

                    <div className="p-2 bg-slate-900/60 rounded-lg">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                        <span>Profit Factor</span>
                        <MetricHelpButton metricId="profit_factor" onOpenHelp={onOpenMetricHelp} size="xs" />
                      </div>
                      <span className="text-sm font-bold text-slate-200 mt-1 block">
                        {res.profitFactor.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-900/60 rounded-lg">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                        <span>DSR Confidence</span>
                        <MetricHelpButton metricId="dsr" onOpenHelp={onOpenMetricHelp} size="xs" />
                      </div>
                      <span className="text-sm font-bold text-purple-400 mt-1 block">
                        {res.dsrConfidencePct}%
                      </span>
                    </div>

                    <div className="p-2 bg-slate-900/60 rounded-lg">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                        <span>Taxes as % Profit</span>
                        <MetricHelpButton metricId="cost_drag" onOpenHelp={onOpenMetricHelp} size="xs" />
                      </div>
                      <span className="text-sm font-bold text-amber-400 mt-1 block">
                        {res.costToProfitRatioPct}%
                      </span>
                    </div>

                    <div className="p-2 bg-slate-900/60 rounded-lg">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                        <span>Avg Holding</span>
                        <MetricHelpButton metricId="turnover_ratio" onOpenHelp={onOpenMetricHelp} size="xs" />
                      </div>
                      <span className="text-sm font-bold text-slate-200 mt-1 block">
                        {res.avgHoldingDays} Days
                      </span>
                    </div>
                  </div>

                  {/* Mathematical Ranking Explanation */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <Scale className="w-4 h-4" />
                      <span>Why This Configuration Ranked #{res.rank}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {res.whyRanked}
                    </p>

                    {/* Quant Strengths List */}
                    <div className="pt-2 flex flex-wrap gap-2">
                      {res.quantStrengths.map((str, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center space-x-1 text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-lg"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{str}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rules, Indicators & Market Regime Suitability */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Indicator &amp; Setup Rules
                      </span>
                      <p className="text-slate-300 text-[11px]">
                        <strong className="text-slate-200">Indicators: </strong>{res.indicatorSetup}
                      </p>
                      <p className="text-slate-300 text-[11px]">
                        <strong className="text-emerald-400">Entry: </strong>{res.entryRule}
                      </p>
                      <p className="text-slate-300 text-[11px]">
                        <strong className="text-rose-400">Exit: </strong>{res.exitRule}
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Retail Execution &amp; Regime Match
                      </span>
                      <p className="text-slate-300 text-[11px]">
                        <strong className="text-slate-200">Ideal Market Regime: </strong>{res.marketRegimeSuitability}
                      </p>
                      <p className="text-slate-300 text-[11px]">
                        <strong className="text-amber-400">Execution Tip: </strong>{res.retailExecutionTakeaway}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        <strong className="text-rose-400">Risk Watchout: </strong>{res.riskWatchout}
                      </p>
                    </div>
                  </div>

                  {/* Direct Action: Load into Backtest */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Parameters calibrated for NSE Next-Open execution (STT &amp; SEBI compliant)</span>
                    </div>

                    <button
                      id={`btn-load-strategy-${res.candidate.strategyId}`}
                      onClick={() => onSelectAndApplyStrategy(
                        res.candidate.strategyId, 
                        res.candidate.variation, 
                        res.candidate.lookbackDays,
                        startDate,
                        endDate
                      )}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer shrink-0"
                    >
                      <span>Load Strategy into Backtester</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
