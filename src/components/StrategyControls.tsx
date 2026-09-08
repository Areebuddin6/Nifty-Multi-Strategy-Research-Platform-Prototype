import React, { useState } from 'react';
import { Sliders, RefreshCw, Play, Info, ChevronDown, ChevronUp, Layers, Compass, Sparkles, Check, ArrowRight } from 'lucide-react';
import { StrategyConfig, StrategyType, IndexUniverse, StrategyVariation } from '../types';
import { PAIR_CANDIDATES, BASKET_CANDIDATES } from '../data/historicalData';

interface StrategyControlsProps {
  config: StrategyConfig;
  onChangeConfig: (newConfig: StrategyConfig) => void;
  onRunBacktest: () => void;
  isSimulating: boolean;
  isSimpleMode?: boolean;
  onOpenVariationModal?: () => void;
}

export const StrategyControls: React.FC<StrategyControlsProps> = ({
  config,
  onChangeConfig,
  onRunBacktest,
  isSimulating,
  isSimpleMode = false,
  onOpenVariationModal,
}) => {
  const [showAdvancedInSimple, setShowAdvancedInSimple] = useState(false);

  const updateField = <K extends keyof StrategyConfig>(field: K, value: StrategyConfig[K]) => {
    onChangeConfig({
      ...config,
      [field]: value,
    });
  };

  const handleStrategyChange = (newStrategy: StrategyType) => {
    let name = '';
    let category: StrategyConfig['category'] = 'Swing';
    let execTiming: StrategyConfig['executionTiming'] = 'next_open';
    let exitTiming: StrategyConfig['exitTiming'] = 'same_close';

    switch (newStrategy) {
      case 'supertrend_swing':
        name = 'Supertrend + 200 EMA Swing';
        category = 'Swing';
        execTiming = 'next_open';
        exitTiming = 'same_close';
        break;
      case 'rsi_pullback':
        name = 'RSI Oversold Pullback (Buy The Dip)';
        category = 'Pullback';
        execTiming = 'next_open';
        exitTiming = 'same_close';
        break;
      case 'golden_cross':
        name = '50 EMA x 200 EMA Golden Cross';
        category = 'Trend Following';
        execTiming = 'next_open';
        exitTiming = 'same_close';
        break;
      case 'donchian_breakout':
        name = '20-Day High Breakout';
        category = 'Breakout';
        execTiming = 'next_open';
        exitTiming = 'same_close';
        break;
      case 'btst_momentum':
        name = 'BTST Top Gainer (Momentum)';
        category = 'BTST';
        execTiming = 'next_open';
        exitTiming = 'same_open';
        break;
      case 'btst_reversal':
        name = 'BTST Dip Buyer (Reversal)';
        category = 'BTST';
        execTiming = 'next_open';
        exitTiming = 'same_open';
        break;
      case 'pairs_cointegration':
        name = 'Twin Stock Arbitrage (ADF Stat-Arb)';
        category = 'Statistical Arbitrage';
        execTiming = 'next_open';
        exitTiming = 'same_close';
        break;
      case 'basket_meanreversion':
        name = 'Sector Basket Stat-Arb';
        category = 'Basket Stat-Arb';
        execTiming = 'next_open';
        exitTiming = 'same_close';
        break;
    }

    onChangeConfig({
      ...config,
      id: newStrategy,
      name,
      category,
      executionTiming: execTiming,
      exitTiming,
      selectedPair: newStrategy === 'pairs_cointegration' ? config.selectedPair || PAIR_CANDIDATES[0].pairId : undefined,
      selectedBasket: newStrategy === 'basket_meanreversion' ? config.selectedBasket || BASKET_CANDIDATES[0].basketId : undefined,
    });
  };

  const handleVariationChange = (variation: StrategyVariation) => {
    updateField('variation', variation);
  };

  // Simple Mode Layout
  if (isSimpleMode) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 shadow-sm transition-colors">
        {/* Top bar: Strategy name and Run button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-emerald-500 uppercase tracking-wider">Retail Strategy Setup</span>
              <span>•</span>
              <span className="capitalize">{config.variation || 'Balanced'} Risk</span>
            </div>
            <h2 className="text-base font-bold text-white">
              {config.name}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenVariationModal && (
              <button
                onClick={onOpenVariationModal}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border border-slate-700 shadow-sm"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Compare 3 Variations</span>
                <span className="sm:hidden">Variations</span>
              </button>
            )}

            <button
              id="btn-run-simulation"
              onClick={onRunBacktest}
              disabled={isSimulating}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Backtest</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Essential Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Trading Strategy
            </label>
            <select
              id="select-strategy"
              value={config.id}
              onChange={(e) => handleStrategyChange(e.target.value as StrategyType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
            >
              <optgroup label="Trend & Swing (Beginner Friendly)">
                <option value="supertrend_swing">Supertrend + 200 EMA Swing</option>
                <option value="golden_cross">50 EMA x 200 EMA Golden Cross</option>
                <option value="donchian_breakout">20-Day High Breakout</option>
              </optgroup>
              <optgroup label="Dip Buying (High Win Rate)">
                <option value="rsi_pullback">RSI Oversold Pullback (Buy The Dip)</option>
              </optgroup>
              <optgroup label="Overnight Momentum">
                <option value="btst_momentum">BTST Top Gainer (Momentum)</option>
                <option value="btst_reversal">BTST Dip Buyer (Reversal)</option>
              </optgroup>
              <optgroup label="Market Neutral (Crash Protected)">
                <option value="pairs_cointegration">Twin Stock Arbitrage (ADF Stat-Arb)</option>
                <option value="basket_meanreversion">Sector Basket Stat-Arb</option>
              </optgroup>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-300">Risk Profile</span>
              {onOpenVariationModal && (
                <button
                  onClick={onOpenVariationModal}
                  className="text-[11px] text-emerald-500 hover:underline cursor-pointer"
                >
                  Compare All
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['conservative', 'balanced', 'aggressive'] as StrategyVariation[]).map((v) => (
                <button
                  key={v}
                  onClick={() => handleVariationChange(v)}
                  className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition cursor-pointer ${
                    (config.variation || 'balanced') === v
                      ? 'bg-slate-800 text-white shadow-sm border border-emerald-500/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v === 'conservative' ? 'Cons.' : v === 'balanced' ? 'Bal.' : 'Aggr.'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Starting Capital (₹)
            </label>
            <select
              id="select-capital"
              value={config.initialCapital}
              onChange={(e) => updateField('initialCapital', Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono font-medium cursor-pointer"
            >
              <option value={50000}>₹ 50,000 (Small Retail)</option>
              <option value={100000}>₹ 1,00,000 (1 Lakh)</option>
              <option value={500000}>₹ 5,00,000 (5 Lakhs)</option>
              <option value={1000000}>₹ 10,00,000 (10 Lakhs)</option>
              <option value={2500000}>₹ 25,00,000 (25 Lakhs)</option>
              <option value={5000000}>₹ 50,00,000 (50 Lakhs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Historical Market Cycle
            </label>
            <select
              id="select-period"
              value={`${config.startDate}_${config.endDate}`}
              onChange={(e) => {
                const [s, end] = e.target.value.split('_');
                onChangeConfig({ ...config, startDate: s, endDate: end });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
            >
              <option value="2018-01-01_2026-08-31">Full Cycle (2018 – 2026)</option>
              <option value="2020-01-01_2024-12-31">Post-COVID Cycle (2020 – 2024)</option>
              <option value="2022-01-01_2026-08-31">Recent Regimes (2022 – 2026)</option>
            </select>
          </div>
        </div>

        {/* Collapsible Advanced Parameters Toggle */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setShowAdvancedInSimple(!showAdvancedInSimple)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1.5 font-medium transition cursor-pointer"
          >
            {showAdvancedInSimple ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showAdvancedInSimple ? 'Hide Technical Parameters' : 'Show Technical Tuning (Z-Score, Lookback, Brokerage)'}</span>
          </button>

          {showAdvancedInSimple && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-800/40 bg-slate-950/60 p-4 rounded-xl">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Universe
                </label>
                <select
                  value={config.universe}
                  onChange={(e) => updateField('universe', e.target.value as IndexUniverse)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  <option value="NIFTY_50">NIFTY 50 Bluechips</option>
                  <option value="NIFTY_100">NIFTY 100 Large Cap</option>
                  <option value="NIFTY_500">NIFTY 500 Broad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Brokerage Model
                </label>
                <select
                  value={config.brokerageFlat}
                  onChange={(e) => updateField('brokerageFlat', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  <option value={0}>₹0 Zero Delivery (Zerodha)</option>
                  <option value={20}>₹20 Flat per order</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Slippage Model
                </label>
                <select
                  value={config.slippageBps}
                  onChange={(e) => updateField('slippageBps', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  <option value={1}>1 bps (Liquid Bluechip)</option>
                  <option value={2}>2 bps (Standard Execution)</option>
                  <option value={5}>5 bps (Conservative)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quant Mode Layout
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Strategy Engine Configuration
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {config.category}
          </span>
        </div>

        <button
          id="btn-run-simulation"
          onClick={onRunBacktest}
          disabled={isSimulating}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
        >
          {isSimulating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute Backtest</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Strategy Plugin
          </label>
          <select
            id="select-strategy"
            value={config.id}
            onChange={(e) => handleStrategyChange(e.target.value as StrategyType)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="supertrend_swing">Supertrend + 200 EMA Swing</option>
            <option value="rsi_pullback">RSI Oversold Pullback (Buy The Dip)</option>
            <option value="golden_cross">50 EMA x 200 EMA Golden Cross</option>
            <option value="donchian_breakout">20-Day High Breakout</option>
            <option value="btst_momentum">BTST Top Gainer (Momentum)</option>
            <option value="btst_reversal">BTST Top Gainer (Reversal)</option>
            <option value="pairs_cointegration">Pairs Cointegration (2-Leg ADF)</option>
            <option value="basket_meanreversion">Basket Stat-Arb (Phase 5 N-Leg)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Point-in-Time Universe
          </label>
          <select
            id="select-universe"
            value={config.universe}
            onChange={(e) => updateField('universe', e.target.value as IndexUniverse)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="NIFTY_50">NIFTY 50 (Top 50 Bluechips)</option>
            <option value="NIFTY_100">NIFTY 100 (Large Cap 100)</option>
            <option value="NIFTY_250">NIFTY 250 (Mid-Large Cap)</option>
            <option value="NIFTY_500">NIFTY 500 (Broad Market)</option>
          </select>
        </div>

        {config.id === 'pairs_cointegration' ? (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Cointegrated Pair (ADF p &lt; 0.05)
            </label>
            <select
              id="select-pair"
              value={config.selectedPair || PAIR_CANDIDATES[0].pairId}
              onChange={(e) => updateField('selectedPair', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {PAIR_CANDIDATES.map((p) => (
                <option key={p.pairId} value={p.pairId}>
                  {p.stockA} / {p.stockB} ({p.sector} • p={p.adfPValue})
                </option>
              ))}
            </select>
          </div>
        ) : config.id === 'basket_meanreversion' ? (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              N-Stock Sector Basket
            </label>
            <select
              id="select-basket"
              value={config.selectedBasket || BASKET_CANDIDATES[0].basketId}
              onChange={(e) => updateField('selectedBasket', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {BASKET_CANDIDATES.map((b) => (
                <option key={b.basketId} value={b.basketId}>
                  {b.name} ({b.tickers.length} tickers • corr {b.meanPairwiseCorrelation})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Risk Profile &amp; Variation
            </label>
            <select
              value={config.variation || 'balanced'}
              onChange={(e) => updateField('variation', e.target.value as StrategyVariation)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="conservative">Conservative (Tighter Stops)</option>
              <option value="balanced">Balanced (Standard)</option>
              <option value="aggressive">Aggressive (Wider Stops &amp; Sizing)</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Initial Portfolio Capital
          </label>
          <select
            id="select-capital"
            value={config.initialCapital}
            onChange={(e) => updateField('initialCapital', Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-medium"
          >
            <option value={100000}>₹ 1,00,000 (1 Lakh)</option>
            <option value={500000}>₹ 5,00,000 (5 Lakhs)</option>
            <option value={1000000}>₹ 10,00,000 (10 Lakhs)</option>
            <option value={2500000}>₹ 25,00,000 (25 Lakhs)</option>
            <option value={5000000}>₹ 50,00,000 (50 Lakhs)</option>
            <option value={10000000}>₹ 1,00,00,000 (1 Crore)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-800/60">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Historical Period
          </label>
          <select
            id="select-period"
            value={`${config.startDate}_${config.endDate}`}
            onChange={(e) => {
              const [s, end] = e.target.value.split('_');
              onChangeConfig({ ...config, startDate: s, endDate: end });
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="2018-01-01_2026-08-31">Full History (2018 – 2026)</option>
            <option value="2020-01-01_2024-12-31">Post-COVID Cycle (2020 – 2024)</option>
            <option value="2022-01-01_2026-08-31">Recent Regimes (2022 – 2026)</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Lookback Window</span>
            <span className="font-mono text-emerald-500 font-semibold">{config.lookbackDays} days</span>
          </div>
          <input
            id="range-lookback"
            type="range"
            min="20"
            max="120"
            step="5"
            value={config.lookbackDays}
            onChange={(e) => updateField('lookbackDays', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Entry Z-Score (Divergence)</span>
            <span className="font-mono text-emerald-500 font-semibold">± {config.entryZScore.toFixed(1)} σ</span>
          </div>
          <input
            id="range-entry-z"
            type="range"
            min="1.2"
            max="3.0"
            step="0.1"
            value={config.entryZScore}
            onChange={(e) => updateField('entryZScore', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Brokerage &amp; Friction Model
          </label>
          <div className="flex items-center space-x-2">
            <select
              id="select-brokerage"
              value={config.brokerageFlat}
              onChange={(e) => updateField('brokerageFlat', Number(e.target.value))}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value={0}>₹0 Brokerage (Zerodha Delivery)</option>
              <option value={20}>₹20 / order Flat</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/40 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-2">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>Execution Contract:</span>
          <span className="font-mono text-slate-300">entry: {config.executionTiming}</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-slate-300">exit: {config.exitTiming}</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-emerald-500">Exit-Date Realized P&amp;L Bucketing</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          STT 0.1% both legs • Stamp Duty 0.015% buy • SEBI ₹10/Cr • GST 18%
        </div>
      </div>
    </div>
  );
};
