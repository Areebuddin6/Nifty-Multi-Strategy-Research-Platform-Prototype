import React from 'react';
import { 
  ShieldCheck, 
  BarChart2, 
  Compass, 
  IndianRupee, 
  Key, 
  HelpCircle, 
  Sparkles, 
  Sliders, 
  Activity, 
  Layers, 
  Database, 
  GitCommit, 
  Sun, 
  Moon,
  Award 
} from 'lucide-react';
import { StrategyType, ThemeMode } from '../types';
import { HelpSectionId } from './HelpGuideModal';

export type NavigationTab = 
  | 'backtest' 
  | 'optimizer'
  | 'strategies' 
  | 'costs' 
  | 'transparency' 
  | 'spread' 
  | 'leaderboard' 
  | 'trades' 
  | 'blueprint' 
  | 'sweep'
  | 'kite';

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  strategyId: StrategyType;
  isSimpleMode: boolean;
  onToggleMode: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenHelp: (section?: HelpSectionId, topicId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  strategyId,
  isSimpleMode,
  onToggleMode,
  theme,
  onToggleTheme,
  onOpenHelp,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Platform identity */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg shadow-sm">
            N
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-semibold text-slate-100 tracking-tight">
                Nifty Multi-Strategy Research Platform
              </h1>
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-bold flex items-center space-x-1.5 ${
                isSimpleMode 
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                  : 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isSimpleMode ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400 animate-pulse'}`} />
                <span>{isSimpleMode ? 'SIMPLE (RETAIL)' : 'QUANT (ADVANCED)'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isSimpleMode 
                ? 'Simplified, tax-adjusted backtesting & strategy discovery for Indian retail traders' 
                : 'Point-in-Time Indian Equities Quantitative Engine • Delivery STT & DSR Compliant'}
            </p>
          </div>
        </div>

        {/* Right side: Mode Switcher, Theme Switch, Status */}
        <div className="flex items-center space-x-2">
          {/* HIGH VISIBILITY SEGMENTED MODE SELECTOR */}
          <div className="flex items-center bg-slate-950/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              id="btn-mode-simple"
              onClick={() => { if (!isSimpleMode) onToggleMode(); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSimpleMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Retail Simple View: Plain-English explanations, visual cards & easy sliders"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSimpleMode ? 'text-slate-950' : 'text-emerald-400'}`} />
              <span>Simple</span>
              {isSimpleMode && <span className="text-[10px] bg-slate-950 text-emerald-400 font-extrabold px-1.5 py-0.2 rounded-full ml-0.5">ACTIVE</span>}
            </button>

            <button
              id="btn-mode-quant"
              onClick={() => { if (isSimpleMode) onToggleMode(); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isSimpleMode
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Institutional Quant Terminal: Econometric matrices, DSR confidence, sensitivity grid"
            >
              <Sliders className={`w-3.5 h-3.5 ${!isSimpleMode ? 'text-white' : 'text-indigo-400'}`} />
              <span>Quant</span>
              {!isSimpleMode && <span className="text-[10px] bg-white text-indigo-900 font-extrabold px-1.5 py-0.2 rounded-full ml-0.5">ACTIVE</span>}
            </button>
          </div>

          {/* Light / Dark Theme Toggle Button */}
          <button
            id="btn-toggle-theme"
            onClick={onToggleTheme}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm cursor-pointer ${
              theme === 'light'
                ? 'bg-amber-500/15 text-amber-700 border-amber-500/30 hover:bg-amber-500/25'
                : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-850 hover:text-white'
            }`}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Engine Status Indicators */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>STT Wired</span>
          </div>

          {/* Help Guide button */}
          <button
            id="btn-open-help-guide"
            onClick={() => onOpenHelp('overview')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white text-xs font-medium transition cursor-pointer"
            title="Open comprehensive methodology, metric formulas, and feature guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto no-scrollbar space-x-1 border-t border-slate-800/60 pt-1 text-sm">
        {isSimpleMode ? (
          <>
            <button
              id="tab-backtest"
              onClick={() => setActiveTab('backtest')}
              className={`px-4 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'backtest'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Results &amp; Overview</span>
            </button>

            <button
              id="tab-optimizer"
              onClick={() => setActiveTab('optimizer')}
              className={`px-4 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'optimizer'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Top Strategy Finder</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                Auto
              </span>
            </button>

            <button
              id="tab-strategies"
              onClick={() => setActiveTab('strategies')}
              className={`px-4 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'strategies'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Strategy Library</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                8 Strats
              </span>
            </button>

            <button
              id="tab-trades"
              onClick={() => setActiveTab('trades')}
              className={`px-4 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'trades'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Trade History</span>
            </button>

            <button
              id="tab-costs"
              onClick={() => setActiveTab('costs')}
              className={`px-4 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'costs'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <IndianRupee className="w-4 h-4 text-amber-400" />
              <span>Taxes &amp; Brokerage (₹)</span>
            </button>

            <button
              id="tab-kite-broker"
              onClick={() => setActiveTab('kite')}
              className={`px-4 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'kite'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Key className="w-4 h-4 text-emerald-400" />
              <span>Zerodha Kite Data</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                .env
              </span>
            </button>

            <button
              id="tab-transparency"
              onClick={() => setActiveTab('transparency')}
              className={`px-4 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'transparency'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Data Transparency &amp; FAQ</span>
            </button>
          </>
        ) : (
          <>
            <button
              id="tab-backtest"
              onClick={() => setActiveTab('backtest')}
              className={`px-3.5 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'backtest'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Strategy Backtest</span>
            </button>

            <button
              id="tab-optimizer"
              onClick={() => setActiveTab('optimizer')}
              className={`px-3.5 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'optimizer'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Strategy Optimizer</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                Screener
              </span>
            </button>

            <button
              id="tab-spread"
              onClick={() => setActiveTab('spread')}
              className={`px-3.5 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'spread'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Spread &amp; Z-Score</span>
              {(strategyId === 'pairs_cointegration' || strategyId === 'basket_meanreversion') && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                  Live
                </span>
              )}
            </button>

            <button
              id="tab-leaderboard"
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3.5 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'leaderboard'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Cross-Strategy Ranking (Phase 6)</span>
            </button>

            <button
              id="tab-trades"
              onClick={() => setActiveTab('trades')}
              className={`px-3.5 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'trades'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Trade Log &amp; INR Costs</span>
            </button>

            <button
              id="tab-sweep"
              onClick={() => setActiveTab('sweep')}
              className={`px-3.5 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'sweep'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Parameter Grid Sweep</span>
            </button>

            <button
              id="tab-blueprint"
              onClick={() => setActiveTab('blueprint')}
              className={`px-3.5 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'blueprint'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <GitCommit className="w-4 h-4" />
              <span>Blueprint &amp; Invariants</span>
            </button>

            <button
              id="tab-kite-broker"
              onClick={() => setActiveTab('kite')}
              className={`px-3.5 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'kite'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Key className="w-4 h-4 text-emerald-400" />
              <span>Zerodha Kite Data</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                .env
              </span>
            </button>

            <button
              id="tab-transparency"
              onClick={() => setActiveTab('transparency')}
              className={`px-3.5 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'transparency'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Data Transparency</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
