import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Navbar, 
  NavigationTab 
} from './components/Navbar';
import { StrategyControls } from './components/StrategyControls';
import { OverviewMetrics } from './components/OverviewMetrics';
import { SimpleOverviewMetrics } from './components/SimpleOverviewMetrics';
import { SimpleStrategyLibrary } from './components/SimpleStrategyLibrary';
import { EquityChart } from './components/EquityChart';
import { SpreadZScoreChart } from './components/SpreadZScoreChart';
import { MonthlyHeatmap } from './components/MonthlyHeatmap';
import { TradeLogTable } from './components/TradeLogTable';
import { CostAnalysisModal } from './components/CostAnalysisModal';
import { VariationComparisonModal } from './components/VariationComparisonModal';
import { HelpGuideModal, HelpSectionId } from './components/HelpGuideModal';
import { MetricHelpModal } from './components/MetricHelpModal';
import { CrossStrategyLeaderboard } from './components/CrossStrategyLeaderboard';
import { ParameterSweepView } from './components/ParameterSweepView';
import { BlueprintExplorer } from './components/BlueprintExplorer';
import { DataTransparencyView } from './components/DataTransparencyView';
import { KiteBrokerConnectView } from './components/KiteBrokerConnectView';
import { StrategyOptimizerView } from './components/StrategyOptimizerView';

import { 
  StrategyConfig, 
  StrategyType, 
  ThemeMode, 
  StrategyVariation, 
  Trade, 
  BacktestResult 
} from './types';
import { runBacktestSimulation } from './engine/backtestSimulator';
import { HISTORICAL_NIFTY_DAILY, PAIR_CANDIDATES, BASKET_CANDIDATES } from './data/historicalData';

export function App() {
  // Theme state: dark by default, persists in localStorage
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('nifty_platform_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // Simple vs Quant mode toggle
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('nifty_platform_ui_mode');
    return saved === 'simple';
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavigationTab>('backtest');

  // Modals state
  const [isCostModalOpen, setIsCostModalOpen] = useState<boolean>(false);
  const [selectedTradeForCost, setSelectedTradeForCost] = useState<Trade | null>(null);
  const [isVariationModalOpen, setIsVariationModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [helpSection, setHelpSection] = useState<HelpSectionId>('overview');
  const [helpTopicId, setHelpTopicId] = useState<string | undefined>(undefined);

  // Financial Metric Explainer Modal state
  const [isMetricHelpModalOpen, setIsMetricHelpModalOpen] = useState<boolean>(false);
  const [activeMetricHelpId, setActiveMetricHelpId] = useState<string>('quant_score');

  const handleOpenMetricHelp = (metricId: string) => {
    setActiveMetricHelpId(metricId);
    setIsMetricHelpModalOpen(true);
  };

  // Strategy configuration
  const [config, setConfig] = useState<StrategyConfig>({
    id: 'supertrend_swing',
    name: 'Supertrend + 200 EMA Swing',
    category: 'Swing',
    universe: 'NIFTY_50',
    variation: 'balanced',
    dataSource: 'calibrated_sandbox',
    lookbackDays: 60,
    entryZScore: 2.0,
    exitZScore: 0.5,
    stopLossZScore: 3.5,
    initialCapital: 1000000,
    maxPositions: 4,
    executionTiming: 'next_open',
    exitTiming: 'same_close',
    brokerageFlat: 0,
    slippageBps: 2,
    startDate: '2018-01-01',
    endDate: '2026-08-31',
    selectedPair: PAIR_CANDIDATES[0].pairId,
    selectedBasket: BASKET_CANDIDATES[0].basketId,
  });

  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Sync theme with HTML class
  useEffect(() => {
    localStorage.setItem('nifty_platform_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Sync UI mode with localStorage
  useEffect(() => {
    localStorage.setItem('nifty_platform_ui_mode', isSimpleMode ? 'simple' : 'quant');
  }, [isSimpleMode]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleMode = () => {
    setIsSimpleMode((prev) => !prev);
  };

  const handleOpenHelp = (section: HelpSectionId = 'overview', topicId?: string) => {
    setHelpSection(section);
    setHelpTopicId(topicId);
    setIsHelpModalOpen(true);
  };

  // Backtest calculation
  const [result, setResult] = useState<BacktestResult>(() => {
    return runBacktestSimulation(config, HISTORICAL_NIFTY_DAILY);
  });

  const handleRunBacktest = useCallback(() => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = runBacktestSimulation(config, HISTORICAL_NIFTY_DAILY);
      setResult(res);
      setIsSimulating(false);
    }, 250);
  }, [config]);

  // Trigger backtest on strategy changes
  const handleSelectStrategyFromLibrary = (stratId: StrategyType, variation?: StrategyVariation) => {
    let name = '';
    let category: StrategyConfig['category'] = 'Swing';

    switch (stratId) {
      case 'supertrend_swing':
        name = 'Supertrend + 200 EMA Swing';
        category = 'Swing';
        break;
      case 'rsi_pullback':
        name = 'RSI Oversold Pullback (Buy The Dip)';
        category = 'Pullback';
        break;
      case 'golden_cross':
        name = '50 EMA x 200 EMA Golden Cross';
        category = 'Trend Following';
        break;
      case 'donchian_breakout':
        name = '20-Day High Breakout';
        category = 'Breakout';
        break;
      case 'btst_momentum':
        name = 'BTST Top Gainer (Momentum)';
        category = 'BTST';
        break;
      case 'btst_reversal':
        name = 'BTST Dip Buyer (Reversal)';
        category = 'BTST';
        break;
      case 'pairs_cointegration':
        name = 'Twin Stock Arbitrage (ADF Stat-Arb)';
        category = 'Statistical Arbitrage';
        break;
      case 'basket_meanreversion':
        name = 'Sector Basket Stat-Arb';
        category = 'Basket Stat-Arb';
        break;
    }

    const newConfig: StrategyConfig = {
      ...config,
      id: stratId,
      name,
      category,
      variation: variation || config.variation || 'balanced',
    };

    setConfig(newConfig);
    const newRes = runBacktestSimulation(newConfig, HISTORICAL_NIFTY_DAILY);
    setResult(newRes);
    setActiveTab('backtest');
  };

  const handleOpenCostBreakdownForTrade = (trade: Trade) => {
    setSelectedTradeForCost(trade);
    setIsCostModalOpen(true);
  };

  const handleOpenTotalCostModal = () => {
    setSelectedTradeForCost(null);
    setIsCostModalOpen(true);
  };

  const handleApplyOptimizedStrategy = (candidate: any) => {
    const updatedConfig: StrategyConfig = {
      ...config,
      id: candidate.strategyId,
      name: candidate.strategyName,
      category: candidate.category as any,
      universe: candidate.universe,
      variation: candidate.variation,
      lookbackDays: candidate.lookbackDays,
      entryZScore: candidate.entryZScore,
      exitZScore: candidate.exitZScore,
      stopLossZScore: candidate.stopLossZScore,
    };
    setConfig(updatedConfig);
    const newRes = runBacktestSimulation(updatedConfig, HISTORICAL_NIFTY_DAILY);
    setResult(newRes);
    setActiveTab('backtest');
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-sans transition-colors duration-200 ${theme === 'light' ? 'light' : ''}`}>
      {/* Navigation Bar with Theme Toggle */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        strategyId={config.id}
        isSimpleMode={isSimpleMode}
        onToggleMode={handleToggleMode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenHelp={handleOpenHelp}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Strategy Control Panel - Hidden in Strategy Optimizer section */}
        {activeTab !== 'optimizer' && (
          <StrategyControls
            config={config}
            onChangeConfig={setConfig}
            onRunBacktest={handleRunBacktest}
            isSimulating={isSimulating}
            isSimpleMode={isSimpleMode}
            onOpenVariationModal={() => setIsVariationModalOpen(true)}
          />
        )}

        {/* Tab 1: Backtest Results & Overview */}
        {activeTab === 'backtest' && (
          <div>
            {/* Overview Metrics Cards */}
            {isSimpleMode ? (
              <SimpleOverviewMetrics
                stats={result.stats}
                initialCapital={config.initialCapital}
                costs={result.totalCosts}
                onOpenCostModal={handleOpenTotalCostModal}
                onOpenHelp={handleOpenHelp}
                onOpenMetricHelp={handleOpenMetricHelp}
              />
            ) : (
              <OverviewMetrics
                stats={result.stats}
                initialCapital={config.initialCapital}
                costs={result.totalCosts}
                onOpenHelp={handleOpenHelp}
                onOpenMetricHelp={handleOpenMetricHelp}
              />
            )}

            {/* Performance Equity Curve with Theme Support */}
            <EquityChart
              dailyReturns={result.dailyReturns}
              initialCapital={config.initialCapital}
              theme={theme}
            />

            {/* Spread / Z-Score Chart (if pairs or basket) */}
            {(config.id === 'pairs_cointegration' || config.id === 'basket_meanreversion') && (
              <SpreadZScoreChart
                spreadPoints={result.spreadPoints || []}
                config={config}
                theme={theme}
              />
            )}

            {/* Monthly Returns Heatmap with Theme Support */}
            <MonthlyHeatmap
              monthlyReturns={result.monthlyReturns}
              theme={theme}
            />

            {/* Executed Trades Table */}
            <TradeLogTable
              trades={result.trades}
              onOpenCostBreakdown={handleOpenCostBreakdownForTrade}
            />
          </div>
        )}

        {/* Tab: Quantitative Strategy Optimizer & Screener */}
        {activeTab === 'optimizer' && (
          <StrategyOptimizerView
            currentConfig={config}
            onApplyOptimizedStrategy={handleApplyOptimizedStrategy}
            isSimpleMode={isSimpleMode}
            theme={theme}
            onOpenHelp={handleOpenHelp}
            onOpenMetricHelp={handleOpenMetricHelp}
          />
        )}

        {/* Tab 2: Strategy Library (Simple Mode) */}
        {activeTab === 'strategies' && (
          <SimpleStrategyLibrary
            currentStrategyId={config.id}
            onSelectStrategy={handleSelectStrategyFromLibrary}
            onRunStrategy={(s) => {
              handleSelectStrategyFromLibrary(s);
            }}
          />
        )}

        {/* Tab 3: Spread & Z-Score (Quant Mode) */}
        {activeTab === 'spread' && (
          <SpreadZScoreChart
            spreadPoints={result.spreadPoints || []}
            config={config}
            theme={theme}
          />
        )}

        {/* Tab 4: Cross-Strategy Leaderboard (Phase 6) */}
        {activeTab === 'leaderboard' && (
          <CrossStrategyLeaderboard
            currentUniverse={config.universe}
            onSelectStrategy={handleSelectStrategyFromLibrary}
            onOpenMetricHelp={handleOpenMetricHelp}
          />
        )}

        {/* Tab 5: Trade Log */}
        {activeTab === 'trades' && (
          <TradeLogTable
            trades={result.trades}
            onOpenCostBreakdown={handleOpenCostBreakdownForTrade}
          />
        )}

        {/* Tab 6: Parameter Grid Sweep */}
        {activeTab === 'sweep' && (
          <ParameterSweepView
            config={config}
            onApplyParameters={(lb, ez) => {
              const updated = {
                ...config,
                lookbackDays: lb,
                entryZScore: ez,
              };
              setConfig(updated);
              const newRes = runBacktestSimulation(updated, HISTORICAL_NIFTY_DAILY);
              setResult(newRes);
              setActiveTab('backtest');
            }}
          />
        )}

        {/* Tab 7: Blueprint & Invariants */}
        {activeTab === 'blueprint' && (
          <BlueprintExplorer />
        )}

        {/* Tab 8: Taxes & Brokerage Breakdown */}
        {activeTab === 'costs' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
            <h2 className="text-xl font-bold text-white mb-2">
              Statutory Taxes &amp; Brokerage Ledger
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Complete breakdown of every rupee paid to the Government of India, NSE, and broker during this backtest.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Total Statutory STT (0.1%)</span>
                <span className="text-xl font-bold font-mono text-amber-400 block mt-1">
                  ₹{result.totalCosts.stt.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Exchange &amp; SEBI Turnover Fees</span>
                <span className="text-xl font-bold font-mono text-white block mt-1">
                  ₹{(result.totalCosts.exchangeFees + result.totalCosts.sebiCharges).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Total Friction Impact</span>
                <span className="text-xl font-bold font-mono text-rose-400 block mt-1">
                  ₹{result.totalCosts.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
            <TradeLogTable
              trades={result.trades}
              onOpenCostBreakdown={handleOpenCostBreakdownForTrade}
            />
          </div>
        )}

        {/* Tab 9: Zerodha Kite Data Connection */}
        {activeTab === 'kite' && (
          <KiteBrokerConnectView />
        )}

        {/* Tab 10: Data Transparency & Integrity */}
        {activeTab === 'transparency' && (
          <DataTransparencyView />
        )}
      </main>

      {/* Modals */}
      <CostAnalysisModal
        isOpen={isCostModalOpen}
        onClose={() => setIsCostModalOpen(false)}
        costs={result.totalCosts}
        selectedTrade={selectedTradeForCost}
      />

      <VariationComparisonModal
        isOpen={isVariationModalOpen}
        onClose={() => setIsVariationModalOpen(false)}
        config={config}
        onSelectVariation={(v) => {
          const updated = { ...config, variation: v };
          setConfig(updated);
          const newRes = runBacktestSimulation(updated, HISTORICAL_NIFTY_DAILY);
          setResult(newRes);
        }}
      />

      <HelpGuideModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        initialSection={helpSection}
        initialTopicId={helpTopicId}
      />

      <MetricHelpModal
        isOpen={isMetricHelpModalOpen}
        onClose={() => setIsMetricHelpModalOpen(false)}
        initialMetricId={activeMetricHelpId}
      />
    </div>
  );
}

export default App;
