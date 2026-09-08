import React from 'react';
import { X, Check, Shield, Zap, TrendingUp, ArrowRight, Award } from 'lucide-react';
import { StrategyType, StrategyVariation, StrategyConfig } from '../types';

interface VariationComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StrategyConfig;
  onSelectVariation: (v: StrategyVariation) => void;
}

interface VariationDetail {
  id: StrategyVariation;
  title: string;
  badge: string;
  icon: any;
  riskRating: string;
  cagrEst: string;
  maxDdEst: string;
  winRateEst: string;
  entryRule: string;
  exitRule: string;
  idealFor: string;
  recommended: boolean;
}

export const VariationComparisonModal: React.FC<VariationComparisonModalProps> = ({
  isOpen,
  onClose,
  config,
  onSelectVariation,
}) => {
  if (!isOpen) return null;

  const variations: VariationDetail[] = [
    {
      id: 'conservative',
      title: 'Conservative (Risk-Averse)',
      badge: 'Lowest Drawdown',
      icon: Shield,
      riskRating: 'Low (1.5% max risk per trade)',
      cagrEst: '16.8% – 19.5%',
      maxDdEst: '-8.2%',
      winRateEst: '68% – 72%',
      entryRule: 'Strict confirmation (Z-Score ±2.2σ or 2-day confirmed trend close)',
      exitRule: 'Early profit booking at first target, trailing stop tight at 1.0 ATR',
      idealFor: 'Capital preservation, retirement accounts, traders sensitive to drawdowns',
      recommended: false,
    },
    {
      id: 'balanced',
      title: 'Balanced (Standard Benchmark)',
      badge: 'Recommended Default',
      icon: TrendingUp,
      riskRating: 'Moderate (2.0% risk per trade)',
      cagrEst: '23.4% – 26.8%',
      maxDdEst: '-12.4%',
      winRateEst: '62% – 66%',
      entryRule: 'Standard statistical trigger (Z-Score ±2.0σ or Supertrend turn)',
      exitRule: 'Systematic mean-reversion target at 0.5σ, standard stop loss at 3.5σ',
      idealFor: 'Most retail swing traders seeking maximum risk-adjusted Sharpe ratio',
      recommended: true,
    },
    {
      id: 'aggressive',
      title: 'Aggressive (High Alpha)',
      badge: 'Maximum Growth',
      icon: Zap,
      riskRating: 'High (3.0% risk per trade, larger position sizing)',
      cagrEst: '31.2% – 36.5%',
      maxDdEst: '-18.6%',
      winRateEst: '54% – 58%',
      entryRule: 'Early aggressive entry on first momentum impulse or ±1.6σ divergence',
      exitRule: 'Wide trailing stops allowing full macro trend runners to mature',
      idealFor: 'Traders with long time horizons willing to stomach steeper drawdowns for maximum compounding',
      recommended: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-colors">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-emerald-500">Risk Profile Comparison</span>
              <span>•</span>
              <span>{config.name}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Select Your Strategy Variation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Variations Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {variations.map((v) => {
            const isCurrent = (config.variation || 'balanced') === v.id;
            const Icon = v.icon;

            return (
              <div
                key={v.id}
                className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-slate-850/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg border ${isCurrent ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {v.recommended && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {v.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">
                    {v.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 block mb-3 font-medium">
                    {v.riskRating}
                  </span>

                  {/* Projected Metrics */}
                  <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800/80 mb-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Projected CAGR</span>
                      <span className="font-mono font-bold text-emerald-400">{v.cagrEst}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Worst Drawdown</span>
                      <span className="font-mono font-semibold text-rose-400">{v.maxDdEst}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Win Rate</span>
                      <span className="font-mono font-semibold text-slate-200">{v.winRateEst}</span>
                    </div>
                  </div>

                  {/* Rules */}
                  <div className="space-y-2 text-xs text-slate-300 mb-4">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Entry Rule:</span>
                      <p className="text-[11px] leading-relaxed text-slate-400">{v.entryRule}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Exit Rule:</span>
                      <p className="text-[11px] leading-relaxed text-slate-400">{v.exitRule}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block mb-2 font-medium">
                    Best for: {v.idealFor}
                  </span>
                  <button
                    onClick={() => {
                      onSelectVariation(v.id);
                      onClose();
                    }}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-600'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Currently Active</span>
                      </>
                    ) : (
                      <>
                        <span>Select {v.id.toUpperCase()}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
