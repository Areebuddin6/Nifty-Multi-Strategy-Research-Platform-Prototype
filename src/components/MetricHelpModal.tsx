import React, { useState, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  BookOpen, 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  Scale, 
  IndianRupee, 
  CheckCircle2, 
  ArrowRight,
  Search,
  Activity,
  Award,
  Zap,
  Percent,
  Sliders
} from 'lucide-react';
import { METRIC_DEFINITIONS, MetricDefinition } from '../data/metricDefinitions';

interface MetricHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMetricId?: string;
}

export const MetricHelpModal: React.FC<MetricHelpModalProps> = ({
  isOpen,
  onClose,
  initialMetricId = 'quant_score',
}) => {
  const [selectedId, setSelectedId] = useState<string>(initialMetricId);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (initialMetricId && METRIC_DEFINITIONS[initialMetricId]) {
      setSelectedId(initialMetricId);
    }
  }, [initialMetricId]);

  if (!isOpen) return null;

  const currentMetric: MetricDefinition = METRIC_DEFINITIONS[selectedId] || METRIC_DEFINITIONS.quant_score;

  const allMetrics = Object.values(METRIC_DEFINITIONS);
  const filteredMetrics = allMetrics.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.shortLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'poor':
        return 'bg-rose-500/15 border-rose-500/30 text-rose-400';
      case 'mediocre':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
      case 'good':
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
      case 'elite':
        return 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                  Financial Metric Explainer &amp; Rules of Thumb
                </h2>
                <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                  Institutional Guide
                </span>
              </div>
              <p className="text-xs text-slate-400">
                What each metric measures, how to interpret the numbers, and good vs. bad benchmarks
              </p>
            </div>
          </div>

          <button
            id="btn-close-metric-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Sidebar + Main Explainer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Quick Metrics Selector Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 p-3 flex flex-col shrink-0">
            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search metrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* List of Metrics */}
            <div className="flex-1 overflow-y-auto space-y-1 max-h-40 md:max-h-none pr-1">
              {filteredMetrics.map((m) => {
                const isSelected = m.id === selectedId;
                return (
                  <button
                    key={m.id}
                    id={`btn-metric-tab-${m.id}`}
                    onClick={() => setSelectedId(m.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="truncate">{m.name}</span>
                    <span className="text-[9px] font-mono uppercase text-slate-500 ml-1 shrink-0">
                      {m.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metric Details Panel */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-300 text-xs leading-relaxed">
            {/* Header of Active Metric */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-100">
                    {currentMetric.name}
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {currentMetric.category}
                </span>
              </div>

              {/* Mathematical Formula Banner */}
              <div className="mt-2 bg-slate-900 border border-slate-800/90 rounded-xl px-3.5 py-2 text-[11px] font-mono text-slate-300 flex items-center space-x-2">
                <span className="text-emerald-400 font-bold font-sans">Formula:</span>
                <span className="text-slate-200 break-all">{currentMetric.formula}</span>
              </div>
            </div>

            {/* Section 1: What It Measures */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <Activity className="w-4 h-4" />
                <span>1. What Does It Measure?</span>
              </div>
              <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
                {currentMetric.whatItMeasures}
              </p>
            </div>

            {/* Section 2: What The Numbers Mean */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                <Scale className="w-4 h-4" />
                <span>2. What Do The Numbers Mean?</span>
              </div>
              <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
                {currentMetric.whatTheNumbersMean}
              </p>
            </div>

            {/* Section 3: Rules of Thumb & Benchmark Ranges */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                  <Award className="w-4 h-4" />
                  <span>3. Rule of Thumb Benchmarks (Good vs. Bad)</span>
                </div>
              </div>

              {/* Golden Heuristic Banner */}
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-amber-300 font-medium text-xs flex items-start space-x-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-200">Rule of Thumb: </strong>
                  {currentMetric.ruleOfThumb}
                </div>
              </div>

              {/* Benchmark Grid Tiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {currentMetric.benchmarks.map((b, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{b.label}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${getVerdictBadge(b.verdict)}`}>
                        {b.range}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Indian Market Specific Context */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center space-x-2 text-teal-400 font-bold text-sm">
                <IndianRupee className="w-4 h-4" />
                <span>4. Indian Market Reality (NSE / SEBI Context)</span>
              </div>
              <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
                {currentMetric.indianMarketContext}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Click on any metric button throughout the app to view this benchmark manual anytime</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
