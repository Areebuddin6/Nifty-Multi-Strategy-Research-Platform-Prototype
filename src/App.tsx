import React, { useState, useMemo, useEffect } from 'react';
import { 
  StrategyConfig, 
  StrategyType, 
  StrategyVariation, 
  ThemeMode, 
  SimulationResult 
} from './types';
import { runBacktestSimulation } from './engine/backtestSimulator';
import { HISTORICAL_NIFTY_DAILY, PAIR_CANDIDATES, BASKET_CANDIDATES } from './data/historicalData';
import { Navbar, NavigationTab } from './components/Navbar';
import { OverviewMetrics } from './components/OverviewMetrics';
import { SimpleOverviewMetrics } from './components/SimpleOverviewMetrics';
import { SimpleStrategyLibrary } from './components/SimpleStrategyLibrary';
import { StrategyControls } from './components/StrategyControls';
import { StrategyOptimizerView } from './components/StrategyOptimizerView';
import { EquityChart } from './components/EquityChart';
import { SpreadZScoreChart } from './components/SpreadZScoreChart';
import { MonthlyHeatmap } from './components/MonthlyHeatmap';
import { TradeLogTable } from './components/TradeLogTable';
import { CrossStrategyLeaderboard } from './components/CrossStrategyLeaderboard';
import { ParameterSweepView } from './components/ParameterSweepView';
import { BlueprintExplorer } from './components/BlueprintExplorer';
import { DataTransparencyView } from './components/DataTransparencyView';
import { KiteBrokerConnectView } from './components/KiteBrokerConnectView';
import { CostAnalysisModal } from './components/CostAnalysisModal';
import { VariationComparisonModal } from './components/VariationComparisonModal';
import { HelpGuideModal, HelpSectionId } from './components/HelpGuideModal';
import { MetricHelpModal } from './components/MetricHelpModal';
import { TrendingUp, BarChart2, Award, ShieldCheck, IndianRupee, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation & View Modes
  const [activeTab, setActiveTab] = useState<NavigationTab>('backtest');
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(true);
  const [theme, setTheme] = useState<ThemeMode>('dark');

  // Modals state
  const [isCostModalOpen, setIsCostModalOpen] = useState<boolean>(false);
  const [isVariationModalOpen, setIsVariationModalOpen] = useState<boolean>(false);
  const [isHelpGuideOpen, setIsHelpGuideOpen] = useState<boolean>(false);
  const [helpSection, setHelpSection] = useState<HelpSectionId>('overview');
  const [isMetricModalOpen, setIsMetricModalOpen] = useState<boolean>(false);
  const [activeMetricId, setActiveMetricId] = useState<string>('quant_score');

  // Strategy Execution Configuration State
  const [config, setConfig] = useState<StrategyConfig>({
    id: 'supertrend_swing',
    name: 'Supertrend + 200 EMA Swing',
    category: 'Trend & Swing' as any,
    universe: 'nifty_50',
    variation: 'balanced',
    lookbackDays: 60,
    entryZScore: 2.0,
    exitZScore: 0.5,
    stopLossZScore: 3.5,
    initialCapital: 1000000, // ₹10,00,000 (10 Lakhs)
    maxPositions: 4,
    executionTiming: 'next_open',
    exitTiming: 'same_close',
    brokerageFlat: 0,
    slippageBps: 2,
    startDate: '2020-01-01',
    endDate: '2026-08-31',
    selectedPair: PAIR_CANDIDATES[0].pairId,
    selectedBasket: BASKET_CANDIDATES[0].basketId,
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Simulation Results Memoization
  const simulationResult: SimulationResult = useMemo(() => {
    return runBacktestSimulation(config, HISTORICAL_NIFTY_DAILY);
  }, [config]);

  // Strategy naming map
  const strategyNames: Record<StrategyType, string> = {
    supertrend_swing: 'Supertrend + 200 EMA Swing',
    rsi_pullback: 'RSI Oversold Pullback (Buy The Dip)',
    golden_cross: '50 EMA x 200 EMA Golden Cross',
    donchian_breakout: '20-Day High Breakout (Turtle)',
    btst_momentum: 'BTST Top Gainer (Momentum)',
    btst_reversal: 'BTST Dip Buyer (Reversal)',
    pairs_cointegration: 'Twin Stock Arbitrage (ADF Stat-Arb)',
    basket_meanreversion: 'Sector Basket Stat-Arb (N-Leg)',
  };

  const handleUpdateConfig = (updates: Partial<StrategyConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleSelectStrategy = (stratId: StrategyType, variation?: StrategyVariation) => {
    setConfig(prev => ({
      ...prev,
      id: stratId,
      name: strategyNames[stratId] || stratId,
      variation: variation || prev.variation,
    }));
  };

  const handleRunStrategy = (stratId: StrategyType) => {
    handleSelectStrategy(stratId);
    setActiveTab('backtest');
  };

  // Called from StrategyOptimizerView when user selects a ranked recommendation
  const handleSelectAndApplyFromOptimizer = (
    stratId: StrategyType, 
    variation: StrategyVariation, 
    lookbackDays: number
  ) => {
    setConfig(prev => ({
      ...prev,
      id: stratId,
      name: strategyNames[stratId] || stratId,
      variation,
      lookbackDays,
    }));
    setActiveTab('backtest');
  };

  const handleRunBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 300);
  };

  const handleOpenHelp = (section: HelpSectionId = 'overview', topicId?: string) => {
    setHelpSection(section);
    setIsHelpGuideOpen(true);
  };

  const handleOpenMetricHelp = (metricId: string) => {
    setActiveMetricId(metricId);
    setIsMetricModalOpen(true);
  };

  const handleApplySweepParameters = (lookback: number, entryZ: number, exitZ: number) => {
    handleUpdateConfig({
      lookbackDays: lookback,
      entryZScore: entryZ,
      exitZScore: exitZ,
    });
    setActiveTab('backtest');
  };

  // Synchronize theme with html and body
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    } else {
      root.classList.remove('light-theme');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#020617';
      document.body.style.color = '#f8fafc';
    }
  }, [theme]);

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'light-theme bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'} transition-colors duration-200`}>
      {/* Platform Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        strategyId={config.id}
        isSimpleMode={isSimpleMode}
        onToggleMode={() => setIsSimpleMode(!isSimpleMode)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenHelp={handleOpenHelp}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* VIEW 1: BACKTEST RESULTS & OVERVIEW */}
        {activeTab === 'backtest' && (
          <div>
            {/* Strategy Execution Controls - Only in Backtest tab where parameter execution belongs! */}
            <StrategyControls
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onRunBacktest={handleRunBacktest}
              isRunning={isRunning}
              isSimpleMode={isSimpleMode}
              onOpenVariationModal={() => setIsVariationModalOpen(true)}
              onOpenCostModal={() => setIsCostModalOpen(true)}
              onOpenHelp={handleOpenHelp}
              onOpenMetricHelp={handleOpenMetricHelp}
            />

            {/* Performance Metrics Cards */}
            {isSimpleMode ? (
              <SimpleOverviewMetrics
                stats={simulationResult.stats}
                initialCapital={config.initialCapital}
                costs={simulationResult.totalCosts}
                onOpenCostModal={() => setIsCostModalOpen(true)}
                onOpenHelp={handleOpenHelp}
                onOpenMetricHelp={handleOpenMetricHelp}
              />
            ) : (
              <OverviewMetrics
                stats={simulationResult.stats}
                initialCapital={config.initialCapital}
                costs={simulationResult.totalCosts}
                onOpenHelp={handleOpenHelp}
                onOpenMetricHelp={handleOpenMetricHelp}
              />
            )}

            {/* Equity Curve Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Compounded Portfolio Equity Growth (Net of All Indian Taxes)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Realistic growth curves simulated with statutory 0.1% STT, 18% GST, and next-day 9:15 AM execution.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsCostModalOpen(true)}
                    className="text-xs text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>View Cost Schedule</span>
                  </button>
                </div>
              </div>

              <EquityChart
                data={simulationResult.dailyReturns.map(d => ({
                  date: d.date,
                  equity: d.portfolioValue,
                  benchmarkEquity: d.benchmarkValue,
                  drawdownPct: d.drawdown,
                }))}
                initialCapital={config.initialCapital}
              />
            </div>

            {/* If Pair or Basket Strategy, display Spread Chart */}
            {(config.id === 'pairs_cointegration' || config.id === 'basket_meanreversion') && (
              <SpreadZScoreChart
                data={simulationResult.spreadPoints}
                entryZ={config.entryZScore}
                exitZ={config.exitZScore}
                pairName={config.name}
              />
            )}

            {/* Monthly Heatmap */}
            <MonthlyHeatmap data={simulationResult.monthlyReturns} />

            {/* Quick Preview of Trade Log */}
            <TradeLogTable
              trades={simulationResult.trades.slice(-15)}
              totalCosts={simulationResult.totalCosts}
              isSimpleMode={isSimpleMode}
            />
          </div>
        )}

        {/* VIEW 2: STRATEGY OPTIMIZER (CLEAN SCREENER - NO ENGINE CONFIGURATION!) */}
        {activeTab === 'optimizer' && (
          <StrategyOptimizerView
            onSelectAndApplyStrategy={handleSelectAndApplyFromOptimizer}
            onOpenMetricHelp={handleOpenMetricHelp}
            isSimpleMode={isSimpleMode}
          />
        )}

        {/* VIEW 3: STRATEGY LIBRARY */}
        {activeTab === 'strategies' && (
          <SimpleStrategyLibrary
            currentStrategyId={config.id}
            onSelectStrategy={handleSelectStrategy}
            onRunStrategy={handleRunStrategy}
          />
        )}

        {/* VIEW 4: TRADE HISTORY */}
        {activeTab === 'trades' && (
          <TradeLogTable
            trades={simulationResult.trades}
            totalCosts={simulationResult.totalCosts}
            isSimpleMode={isSimpleMode}
          />
        )}

        {/* VIEW 5: COSTS & TAX AUDIT */}
        {activeTab === 'costs' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
                  <IndianRupee className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold uppercase tracking-wider text-amber-500">
                    Indian Statutory Compliance
                  </span>
                  <span>•</span>
                  <span>Ministry of Finance / SEBI Tariff Schedule</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  Statutory Tax, Levy &amp; Brokerage Friction Audit
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Every trade in this platform complies strictly with Indian equity delivery taxation rules.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-medium">Securities Transaction Tax (STT)</span>
                  <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
                    ₹{simulationResult.totalCosts.stt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">0.1% on buy and sell turnover</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-medium">GST + Exchange Turnover</span>
                  <span className="text-xl font-bold font-mono text-slate-200 mt-1 block">
                    ₹{(simulationResult.totalCosts.gst + simulationResult.totalCosts.exchangeFees).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">18% GST + 0.00297% NSE fees</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-medium">Total Friction Deducted</span>
                  <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">
                    ₹{simulationResult.totalCosts.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-emerald-400 mt-1 block">Already deducted from equity</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setIsCostModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  Open Full Government Tariff Schedule Table
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: SPREAD & Z-SCORE */}
        {activeTab === 'spread' && (
          <SpreadZScoreChart
            data={simulationResult.spreadPoints}
            entryZ={config.entryZScore}
            exitZ={config.exitZScore}
            pairName={config.name}
          />
        )}

        {/* VIEW 7: CROSS STRATEGY LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <CrossStrategyLeaderboard
            onSelectStrategy={handleSelectStrategy}
            currentStrategyId={config.id}
          />
        )}

        {/* VIEW 8: PARAMETER SWEEP */}
        {activeTab === 'sweep' && (
          <ParameterSweepView
            config={config}
            onApplyParameters={handleApplySweepParameters}
          />
        )}

        {/* VIEW 9: BLUEPRINT & INVARIANTS */}
        {activeTab === 'blueprint' && (
          <BlueprintExplorer />
        )}

        {/* VIEW 10: DATA TRANSPARENCY */}
        {activeTab === 'transparency' && (
          <DataTransparencyView
            onOpenHelp={handleOpenHelp}
            onNavigateToKite={() => setActiveTab('kite')}
          />
        )}

        {/* VIEW 11: ZERODHA KITE CONNECT */}
        {activeTab === 'kite' && (
          <KiteBrokerConnectView />
        )}
      </main>

      {/* MODALS */}
      {/* 1. Metric Help Explainer Modal */}
      <MetricHelpModal
        isOpen={isMetricModalOpen}
        onClose={() => setIsMetricModalOpen(false)}
        initialMetricId={activeMetricId}
      />

      {/* 2. Statutory Cost Schedule Modal */}
      <CostAnalysisModal
        isOpen={isCostModalOpen}
        onClose={() => setIsCostModalOpen(false)}
        costs={simulationResult.totalCosts}
      />

      {/* 3. Strategy Variation Selector Modal */}
      <VariationComparisonModal
        isOpen={isVariationModalOpen}
        onClose={() => setIsVariationModalOpen(false)}
        config={config}
        onSelectVariation={(variation) => handleUpdateConfig({ variation })}
      />

      {/* 4. Methodology & Rules Guide Modal */}
      <HelpGuideModal
        isOpen={isHelpGuideOpen}
        onClose={() => setIsHelpGuideOpen(false)}
        initialSection={helpSection}
      />
    </div>
  );
}
