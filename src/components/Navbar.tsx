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
  const isLight = theme === 'light';

  const tabInactiveClass = isLight
    ? 'border-transparent text-slate-600 hover:text-slate-950 hover:border-slate-300'
    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700';

  const tabActiveEmerald = isLight
    ? 'border-emerald-600 text-emerald-700 bg-emerald-50 font-semibold'
    : 'border-emerald-500 text-emerald-400 bg-emerald-500/5';

  const tabActiveAmber = isLight
    ? 'border-amber-600 text-amber-700 bg-amber-50 font-semibold'
    : 'border-amber-500 text-amber-400 bg-amber-500/5';

  return (
    <header className={`border-b sticky top-0 z-40 transition-colors backdrop-blur ${
      isLight ? 'border-slate-200 bg-white/95 text-slate-900 shadow-xs' : 'border-slate-800 bg-slate-950/80 text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Platform identity */}
        <div className="flex items-center space-x-3">
          <div className={`h-9 w-9 rounded-lg border flex items-center justify-center font-mono font-bold text-lg shadow-sm ${
            isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            N
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className={`text-base font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Nifty Multi-Strategy Research Platform
              </h1>
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-bold flex items-center space-x-1.5 ${
                isSimpleMode 
                  ? (isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300')
                  : (isLight ? 'bg-indigo-50 border-indigo-300 text-indigo-800' : 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300')
              }`}>
                <span className={`w-2 h-2 rounded-full ${isSimpleMode ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500 animate-pulse'}`} />
                <span>{isSimpleMode ? 'SIMPLE (RETAIL)' : 'QUANT (ADVANCED)'}</span>
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {isSimpleMode 
                ? 'Simplified, tax-adjusted backtesting & strategy discovery for Indian retail traders' 
                : 'Point-in-Time Indian Equities Quantitative Engine • Delivery STT & DSR Compliant'}
            </p>
          </div>
        </div>

        {/* Right side: Mode Switcher, Theme Switch, Status */}
        <div className="flex items-center space-x-2">
          {/* HIGH VISIBILITY SEGMENTED MODE SELECTOR */}
          <div className={`flex items-center p-1 rounded-2xl border shadow-inner ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950/90 border-slate-800'
          }`}>
            <button
              id="btn-mode-simple"
              onClick={() => { if (!isSimpleMode) onToggleMode(); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSimpleMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Retail Simple View: Plain-English explanations, visual cards & easy sliders"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSimpleMode ? 'text-slate-950' : 'text-emerald-500'}`} />
              <span>Simple</span>
              {isSimpleMode && <span className="text-[10px] bg-slate-950 text-emerald-400 font-extrabold px-1.5 py-0.2 rounded-full ml-0.5">ACTIVE</span>}
            </button>

            <button
              id="btn-mode-quant"
              onClick={() => { if (isSimpleMode) onToggleMode(); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isSimpleMode
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Institutional Quant Terminal: Econometric matrices, DSR confidence, sensitivity grid"
            >
              <Sliders className={`w-3.5 h-3.5 ${!isSimpleMode ? 'text-white' : 'text-indigo-500'}`} />
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
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Engine Status Indicators */}
          <div className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs font-mono ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>STT Wired</span>
          </div>

          {/* Help Guide button */}
          <button
            id="btn-open-help-guide"
            onClick={() => onOpenHelp('overview')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:text-slate-950'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:text-white'
            }`}
            title="Open comprehensive methodology, metric formulas, and feature guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto no-scrollbar space-x-1 border-t pt-1 text-sm ${
        isLight ? 'border-slate-200' : 'border-slate-800/60'
      }`}>
        {isSimpleMode ? (
          <>
            <button
              id="tab-backtest"
              onClick={() => setActiveTab('backtest')}
              className={`px-4 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'backtest'
                  ? tabActiveEmerald
                  : tabInactiveClass
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
                  ? tabActiveAmber
                  : tabInactiveClass
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>Top Strategy Finder</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-300'
              }`}>
                Auto
              </span>
            </button>

            <button
              id="tab-strategies"
              onClick={() => setActiveTab('strategies')}
              className={`px-4 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'strategies'
                  ? tabActiveEmerald
                  : tabInactiveClass
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-500" />
              <span>Strategy Library</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                8 Strats
              </span>
            </button>

            <button
              id="tab-trades"
              onClick={() => setActiveTab('trades')}
              className={`px-4 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'trades'
                  ? tabActiveEmerald
                  : tabInactiveClass
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
                  ? tabActiveEmerald
                  : tabInactiveClass
              }`}
            >
              <IndianRupee className="w-4 h-4 text-amber-500" />
              <span>Taxes &amp; Brokerage (₹)</span>
            </button>

            <button
              id="tab-kite-broker"
              onClick={() => setActiveTab('kite')}
              className={`px-4 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'kite'
                  ? tabActiveEmerald
                  : tabInactiveClass
              }`}
            >
              <Key className="w-4 h-4 text-emerald-500" />
              <span>Zerodha Kite Data</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                .env
              </span>
            </button>

            <button
              id="tab-transparency"
              onClick={() => setActiveTab('transparency')}
              className={`px-4 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'transparency'
                  ? tabActiveEmerald
                  : tabInactiveClass
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
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
                  ? tabActiveEmerald
                  : tabInactiveClass
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
                  ? tabActiveAmber
                  : tabInactiveClass
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>Strategy Optimizer</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-300'
              }`}>
                Screener
              </span>
            </button>

            <button
              id="tab-spread"
              onClick={() => setActiveTab('spread')}
              className={`px-3.5 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'spread'
                  ? tabActiveEmerald
                  : tabInactiveClass
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Spread &amp; Z-Score</span>
              {(strategyId === 'pairs_cointegration' || strategyId === 'basket_meanreversion') && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  Live
                </span>
              )}
            </button>

            <button
              id="tab-leaderboard"
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3.5 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'leaderboard'
                  ? tabActiveEmerald
                  : tabInactiveClass
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
                  ? tabActiveEmerald
                  : tabInactiveClass
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
                  ? tabActiveEmerald
                  : tabInactiveClass
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
                  ? tabActiveEmerald
                  : tabInactiveClass
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
                  ? tabActiveEmerald
                  : tabInactiveClass
              }`}
            >
              <Key className="w-4 h-4 text-emerald-500" />
              <span>Zerodha Kite Data</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                .env
              </span>
            </button>

            <button
              id="tab-transparency"
              onClick={() => setActiveTab('transparency')}
              className={`px-3.5 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'transparency'
                  ? tabActiveEmerald
                  : tabInactiveClass
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Data Transparency</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
