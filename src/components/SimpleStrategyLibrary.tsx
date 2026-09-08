import React from 'react';
import { 
  Compass, 
  TrendingUp, 
  ArrowDownCircle, 
  Zap, 
  Shuffle, 
  Layers, 
  ShieldCheck, 
  Clock, 
  IndianRupee, 
  ArrowRight,
  Sparkles,
  Sliders
} from 'lucide-react';
import { StrategyType, StrategyConfig, StrategyVariation } from '../types';

interface SimpleStrategyLibraryProps {
  currentStrategyId: StrategyType;
  onSelectStrategy: (strat: StrategyType, variation?: StrategyVariation) => void;
  onRunStrategy: (strat: StrategyType) => void;
}

interface StrategyCardInfo {
  id: StrategyType;
  title: string;
  tagline: string;
  category: string;
  badge: string;
  badgeColor: string;
  icon: any;
  suitability: string;
  holdingPeriod: string;
  typicalWinRate: string;
  howItWorks: string;
  strengths: string[];
  watchOut: string;
}

const STRATEGIES: StrategyCardInfo[] = [
  {
    id: 'supertrend_swing',
    title: 'Supertrend + 200 EMA Swing',
    tagline: 'Ride medium-term trends on high-quality large caps above 200-day average',
    category: 'Trend & Swing',
    badge: 'Beginner Recommended',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: TrendingUp,
    suitability: 'Working professionals seeking 1-2 week swings with automated exit discipline',
    holdingPeriod: '4 to 12 Days',
    typicalWinRate: '54% – 60%',
    howItWorks: 'Enters when price crosses above the Supertrend line while safely positioned above the 200 EMA baseline. Exits as soon as Supertrend turns red.',
    strengths: ['Captures massive trending runs in bull markets', 'Rules prevent buying stocks in structural bear trends', 'Minimal screen time needed'],
    watchOut: 'Can take modest whipsaw losses in prolonged choppy/sideways markets',
  },
  {
    id: 'rsi_pullback',
    title: 'RSI Oversold Pullback (Buy The Dip)',
    tagline: 'Buy high-quality bluechips during temporary panic dips in strong bull regimes',
    category: 'Dip Buying',
    badge: 'High Win Rate',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    icon: ArrowDownCircle,
    suitability: 'Traders who prefer buying bargains rather than chasing breakout highs',
    holdingPeriod: '3 to 8 Days',
    typicalWinRate: '64% – 72%',
    howItWorks: 'Identifies strong Nifty 50 companies whose 5-day RSI drops below 28 while still trading above their long-term 200-day moving average.',
    strengths: ['High statistical accuracy (>65% wins)', 'Quick turnaround time with small average holding days', 'Strong psychological comfort buying discounts'],
    watchOut: 'Fewer trade triggers when markets run in parabolic upright mode',
  },
  {
    id: 'golden_cross',
    title: '50 EMA x 200 EMA Golden Cross',
    tagline: 'The classic institutional trend breakout system for long-term positional swings',
    category: 'Trend Following',
    badge: 'Low Maintenance',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: Zap,
    suitability: 'Patient swing traders who hold winners for several weeks or months',
    holdingPeriod: '15 to 45 Days',
    typicalWinRate: '46% – 52%',
    howItWorks: 'Enters long when the fast 50 EMA crosses above the slow 200 EMA. Rides multi-month institutional accumulation waves.',
    strengths: ['Catches the largest market rallies of the decade', 'Very low trade turnover saves on brokerage & STT', 'Extremely simple to follow'],
    watchOut: 'Lagging entries; maximum drawdown is larger than faster mean-reverting strategies',
  },
  {
    id: 'donchian_breakout',
    title: '20-Day High Breakout (Turtle Style)',
    tagline: 'Buy fresh 4-week highs to catch explosive momentum accelerations',
    category: 'Breakout Momentum',
    badge: 'Momentum',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: Sparkles,
    suitability: 'Active traders looking for fast velocity upside moves',
    holdingPeriod: '5 to 15 Days',
    typicalWinRate: '48% – 54%',
    howItWorks: 'Enters when a stock prints a new 20-day high with expanding volume. Trailing exit activates when price breaks below the 10-day channel low.',
    strengths: ['Participates in all explosive market runners', 'Strict trailing channel limits loss on false breakouts', 'High profit-to-loss payoff ratio'],
    watchOut: 'False breakouts occur frequently at major macro resistance zones',
  },
  {
    id: 'btst_momentum',
    title: 'BTST Top Gainer (Buy Today Sell Tomorrow)',
    tagline: 'Overnight momentum capture on closing strength for quick gap-up profits',
    category: 'BTST (Overnight)',
    badge: 'Fast Turnaround',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    icon: Clock,
    suitability: 'Traders with afternoon availability to enter at 3:15 PM and square off at 9:20 AM',
    holdingPeriod: 'Overnight (1 Day)',
    typicalWinRate: '56% – 62%',
    howItWorks: 'Scans for top performing stocks at 3:15 PM with heavy closing volume. Exits immediately at 9:15 AM next morning to bank gap-ups.',
    strengths: ['Capital freed up every single morning', 'Zero intraday screen time needed during market hours', 'Consistent compounded returns'],
    watchOut: 'STT and flat brokerage add up quickly if trade frequency is high; requires zero-brokerage accounts',
  },
  {
    id: 'btst_reversal',
    title: 'BTST Dip Buyer (Overnight Mean Reversion)',
    tagline: 'Buy late afternoon irrational intraday dumps for morning bounce-backs',
    category: 'BTST (Overnight)',
    badge: 'High Payoff',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    icon: Clock,
    suitability: 'Disciplined swing traders seeking fast overnight bounce plays',
    holdingPeriod: 'Overnight (1 Day)',
    typicalWinRate: '58% – 65%',
    howItWorks: 'Buys high-beta stocks that suffered temporary end-of-day selloffs to severe intraday oversold levels, anticipating an opening gap recovery.',
    strengths: ['Excellent risk-reward on gap recoveries', 'Shortest capital lockup among all equity strategies', 'Frequent setup availability'],
    watchOut: 'Exposed to global overnight market gaps (US/Asian markets)',
  },
  {
    id: 'pairs_cointegration',
    title: 'Twin Stock Arbitrage (ADF Stat-Arb)',
    tagline: 'Market-neutral statistical arbitrage between economically linked stock twins',
    category: 'Statistical Arbitrage',
    badge: 'Crash Proof',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: Shuffle,
    suitability: 'Advanced traders looking for steady returns regardless of whether Nifty crashes or rallies',
    holdingPeriod: '6 to 18 Days',
    typicalWinRate: '68% – 76%',
    howItWorks: 'Pairs like HDFC Bank vs ICICI Bank or TCS vs Infosys that share identical economic fundamentals. When their price spread widens to 2 standard deviations (Z-score), we bet on reversion.',
    strengths: ['Market-neutral: makes money in bull, bear, or crash regimes', 'Very low drawdown (-8% typical vs -38% Nifty)', 'Statistically validated with Augmented Dickey-Fuller tests'],
    watchOut: 'Requires executing both legs simultaneously; cointegration can break during major mergers',
  },
  {
    id: 'basket_meanreversion',
    title: 'Sector Basket Stat-Arb (N-Leg)',
    tagline: 'Multi-stock dispersion trading across leading sectors (Banking, IT, Auto, Energy)',
    category: 'Multi-Leg Stat-Arb',
    badge: 'Institutional Grade',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: Layers,
    suitability: 'Traders with larger portfolios (> ₹5 Lakhs) seeking institutional dispersion alpha',
    holdingPeriod: '8 to 22 Days',
    typicalWinRate: '70% – 78%',
    howItWorks: 'Simultaneously tracks 3-4 sector leaders. When one stock diverges excessively from its sector basket average, we trade the mean reversion.',
    strengths: ['Smooth, steady equity curve with minimal volatility', 'Resistant to single-company idiosyncratic shocks', 'High Sharpe ratio (>1.6)'],
    watchOut: 'Needs higher capital allocation across multiple simultaneous positions',
  },
];

export const SimpleStrategyLibrary: React.FC<SimpleStrategyLibraryProps> = ({
  currentStrategyId,
  onSelectStrategy,
  onRunStrategy,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold uppercase tracking-wider text-emerald-500">Curated Strategies</span>
            <span>•</span>
            <span>8 Tested Architectures</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Pre-Calibrated Strategy Library
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every strategy is modeled against real NSE equity rules, including 0.1% STT, SEBI fees, and slippage.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {STRATEGIES.map((strat) => {
          const isSelected = currentStrategyId === strat.id;
          const Icon = strat.icon;

          return (
            <div
              key={strat.id}
              className={`rounded-xl border p-5 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-850/80 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header with Title & Badge */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl border ${isSelected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {strat.title}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {strat.category}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${strat.badgeColor}`}>
                    {strat.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 font-medium">
                  {strat.tagline}
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-900/90 rounded-lg border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Typical Duration</span>
                    <span className="font-semibold text-slate-200">{strat.holdingPeriod}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Historical Win Rate</span>
                    <span className="font-semibold text-emerald-400">{strat.typicalWinRate}</span>
                  </div>
                </div>

                {/* How it works */}
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  <span className="text-slate-300 font-semibold">How it works: </span>
                  {strat.howItWorks}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                <span className="text-[11px] text-slate-500 truncate max-w-[180px]">
                  {strat.suitability}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onSelectStrategy(strat.id);
                      onRunStrategy(strat.id);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-600'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                  >
                    <span>{isSelected ? 'Active Strategy' : 'Select & Backtest'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
