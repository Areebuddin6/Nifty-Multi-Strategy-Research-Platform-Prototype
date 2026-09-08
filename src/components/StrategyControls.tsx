import React from 'react';
import { 
  Play, 
  Sliders, 
  IndianRupee, 
  Layers, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  HelpCircle,
  TrendingUp,
  Percent
} from 'lucide-react';
import { 
  StrategyConfig, 
  StrategyType, 
  StrategyVariation, 
  IndexUniverse 
} from '../types';
import { PAIR_CANDIDATES, BASKET_CANDIDATES } from '../data/historicalData';

interface StrategyControlsProps {
  config: StrategyConfig;
  onUpdateConfig: (newConfig: Partial<StrategyConfig>) => void;
  onRunBacktest: () => void;
  isRunning: boolean;
  isSimpleMode: boolean;
  onOpenVariationModal?: () => void;
  onOpenCostModal?: () => void;
  onOpenHelp?: (section?: any, topicId?: string) => void;
  onOpenMetricHelp?: (metricId: string) => void;
}

export const StrategyControls: React.FC<StrategyControlsProps> = ({
  config,
  onUpdateConfig,
  onRunBacktest,
  isRunning,
  isSimpleMode,
  onOpenVariationModal,
  onOpenCostModal,
  onOpenHelp,
  onOpenMetricHelp,
}) => {
  const isPairsOrBasket = config.id === 'pairs_cointegration' || config.id === 'basket_meanreversion';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-emerald-500">Execution Parameters</span>
            <span>•</span>
            <span>NSE Equities</span>
          </div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>{config.name}</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {config.variation.toUpperCase()}
            </span>
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenVariationModal && (
            <button
              onClick={onOpenVariationModal}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              Risk Profile ({config.variation})
            </button>
          )}

          {onOpenCostModal && (
            <button
              onClick={onOpenCostModal}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 transition cursor-pointer flex items-center space-x-1"
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>STT Schedule</span>
            </button>
          )}

          <button
            onClick={onRunBacktest}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Backtesting...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-xs">
        {/* Universe */}
        <div>
          <label className="text-slate-400 block mb-1.5 font-medium">Stock Universe</label>
          <select
            value={config.universe}
            onChange={(e) => onUpdateConfig({ universe: e.target.value as IndexUniverse })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
          >
            <optgroup label="Broad Market Indices">
              <option value="NIFTY_50">NIFTY 50 (50 Bluechips)</option>
              <option value="NIFTY_NEXT_50">NIFTY NEXT 50 (Top 51-100 Largecaps)</option>
              <option value="NIFTY_100">NIFTY 100 (Top 100 Largecaps)</option>
              <option value="NIFTY_200">NIFTY 200 (Top 200 Large & Mid)</option>
              <option value="NIFTY_500">NIFTY 500 (Comprehensive All 500)</option>
            </optgroup>
            <optgroup label="Midcap Indices">
              <option value="NIFTY_MIDCAP_50">NIFTY MIDCAP 50 (High-Beta 50)</option>
              <option value="NIFTY_MIDCAP_100">NIFTY MIDCAP 100 (Top 100 Midcaps)</option>
              <option value="NIFTY_MIDCAP_150">NIFTY MIDCAP 150 (Rank 101-250)</option>
            </optgroup>
            <optgroup label="Smallcap Indices">
              <option value="NIFTY_SMALLCAP_50">NIFTY SMALLCAP 50 (Growth 50)</option>
              <option value="NIFTY_SMALLCAP_100">NIFTY SMALLCAP 100 (Liquid Smallcaps)</option>
              <option value="NIFTY_SMALLCAP_250">NIFTY SMALLCAP 250 (Rank 251-500)</option>
            </optgroup>
            <optgroup label="Sectoral Indices">
              <option value="NIFTY_BANK">NIFTY BANK (Banking Sector)</option>
              <option value="NIFTY_IT">NIFTY IT (Technology Sector)</option>
              <option value="NIFTY_AUTO">NIFTY AUTO (Automobile OEMs)</option>
              <option value="NIFTY_PHARMA">NIFTY PHARMA (Healthcare & API)</option>
              <option value="NIFTY_FMCG">NIFTY FMCG (Consumer Goods)</option>
              <option value="NIFTY_METAL">NIFTY METAL (Steel & Smelters)</option>
              <option value="NIFTY_ENERGY">NIFTY ENERGY (Oil & Power)</option>
            </optgroup>
          </select>
        </div>

        {/* Capital */}
        <div>
          <label className="text-slate-400 block mb-1.5 font-medium">Initial Portfolio Capital</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-500">₹</span>
            <input
              type="number"
              value={config.initialCapital}
              step={100000}
              onChange={(e) => onUpdateConfig({ initialCapital: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Lookback Window */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1.5 font-medium">
            <span>Confirmation Window</span>
            <span className="font-mono text-emerald-400">{config.lookbackDays} Days</span>
          </div>
          <input
            type="range"
            min={15}
            max={120}
            step={5}
            value={config.lookbackDays}
            onChange={(e) => onUpdateConfig({ lookbackDays: Number(e.target.value) })}
            className="w-full accent-emerald-500"
          />
        </div>

        {/* Execution Mode */}
        <div>
          <label className="text-slate-400 block mb-1.5 font-medium">Execution Engine</label>
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Next-Open (3:15 PM Fill)</span>
          </div>
        </div>
      </div>

      {/* Multi-Decade Time Horizon & Macro Regimes Selector */}
      <div className="mt-4 pt-4 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">Historical Backtest Horizon:</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              {config.startDate} → {config.endDate} (
              {((new Date(config.endDate).getTime() - new Date(config.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)} Years)
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Simulates point-in-time NSE liquidity, circuit limits, and statutory taxes
          </span>
        </div>

        {/* Quick Horizon Presets & Custom Backtest Horizon */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            { label: '30 Years (1996–2026)', start: '1996-01-01', end: '2026-08-31', badge: 'Full NSE History' },
            { label: '20 Years (2006–2026)', start: '2006-01-01', end: '2026-08-31', badge: 'Includes GFC' },
            { label: '10 Years (2016–2026)', start: '2016-01-01', end: '2026-08-31', badge: 'DeMon & COVID' },
            { label: '5 Years (2020–2026)', start: '2020-01-01', end: '2026-08-31', badge: 'COVID Supercycle' },
            { label: '3 Years (2023–2026)', start: '2023-01-01', end: '2026-08-31', badge: 'High-Rate Regime' },
          ].map((preset) => {
            const isSelected = config.startDate === preset.start && config.endDate === preset.end;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onUpdateConfig({ startDate: preset.start, endDate: preset.end })}
                className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium flex items-center space-x-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-semibold shadow-xs'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{preset.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
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
            ].some((p) => config.startDate === p.start && config.endDate === p.end);
            const isCustom = !isPreset;

            return (
              <button
                type="button"
                id="custom-horizon-button"
                onClick={() => {
                  document.getElementById('backtest-start-date')?.focus();
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium flex items-center space-x-1.5 cursor-pointer ${
                  isCustom
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-semibold shadow-xs'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>Custom Backtest Horizon</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition-colors ${
                    isCustom
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}
                >
                  {isCustom ? 'Active' : 'Custom Dates'}
                </span>
              </button>
            );
          })()}
        </div>

        {/* Date Inputs for Custom Tuning */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs shadow-sm">
          <div>
            <label className="text-slate-400 block mb-1 font-semibold text-[11px] uppercase tracking-wider">Start Date</label>
            <input
              id="backtest-start-date"
              type="date"
              value={config.startDate}
              min="1996-01-01"
              max={config.endDate}
              onChange={(e) => onUpdateConfig({ startDate: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-xs shadow-xs transition-colors"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1 font-semibold text-[11px] uppercase tracking-wider">End Date</label>
            <input
              id="backtest-end-date"
              type="date"
              value={config.endDate}
              min={config.startDate}
              max="2026-12-31"
              onChange={(e) => onUpdateConfig({ endDate: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-xs shadow-xs transition-colors"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col justify-center">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-1.5 block">
              Active Macro Stress Regimes In This Window:
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
                const startYr = parseInt(config.startDate.slice(0, 4)) || 2020;
                const endYr = parseInt(config.endDate.slice(0, 4)) || 2026;
                const isActive = startYr <= regime.to && endYr >= regime.from;
                return (
                  <span
                    key={regime.name}
                    className={`text-[10px] px-2.5 py-0.5 rounded-md border font-semibold transition-colors ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-2xs'
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
    </div>
  );
};
