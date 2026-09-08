export type StrategyType = 
  | 'supertrend_swing'
  | 'rsi_pullback'
  | 'golden_cross'
  | 'donchian_breakout'
  | 'btst_momentum' 
  | 'btst_reversal' 
  | 'pairs_cointegration' 
  | 'basket_meanreversion';

export type StrategyVariation = 'conservative' | 'balanced' | 'aggressive';

export type IndexUniverse = 
  | 'NIFTY_50' 
  | 'NIFTY_NEXT_50' 
  | 'NIFTY_100' 
  | 'NIFTY_200' 
  | 'NIFTY_MIDCAP_50'
  | 'NIFTY_MIDCAP_100'
  | 'NIFTY_MIDCAP_150'
  | 'NIFTY_SMALLCAP_50'
  | 'NIFTY_SMALLCAP_100'
  | 'NIFTY_SMALLCAP_250'
  | 'NIFTY_500'
  | 'NIFTY_BANK'
  | 'NIFTY_IT'
  | 'NIFTY_AUTO'
  | 'NIFTY_PHARMA'
  | 'NIFTY_FMCG'
  | 'NIFTY_METAL'
  | 'NIFTY_ENERGY'
  | 'nifty_50'
  | 'nifty_next_50'
  | 'nifty_100'
  | 'nifty_200'
  | 'nifty_midcap_100'
  | 'nifty_500';

export type DataSourceType = 'calibrated' | 'kite_broker';

export type ThemeMode = 'dark' | 'light';

export interface StrategyConfig {
  id: StrategyType;
  name: string;
  category: 'Trend Following' | 'Mean Reversion' | 'Breakout' | 'BTST' | 'Statistical Arbitrage' | 'Basket Stat-Arb' | 'Swing' | 'Pullback' | 'Trend & Swing';
  universe: IndexUniverse;
  variation: StrategyVariation;
  lookbackDays: number;
  entryZScore: number;
  exitZScore: number;
  stopLossZScore: number;
  initialCapital: number;
  maxPositions: number;
  selectedPair?: string;
  selectedBasket?: string;
  executionTiming: 'next_open' | 'same_close';
  exitTiming: 'same_open' | 'same_close';
  brokerageFlat: number; // 0 for discount broker, 20 for standard
  slippageBps: number; // basis points (e.g. 5 bps = 0.05%)
  startDate: string;
  endDate: string;
  dataSource?: DataSourceType;
}

export interface KiteCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface KiteAuthStatus {
  isConfigured: boolean;
  hasApiKey: boolean;
  hasApiSecret: boolean;
  hasAccessToken: boolean;
  loginUrl: string;
  userProfile?: {
    user_id?: string;
    user_name?: string;
    email?: string;
    broker?: string;
  };
  cachedSymbolsCount?: number;
}

export interface TradeCost {
  turnoverBuy: number;
  turnoverSell: number;
  totalTurnover: number;
  stt: number; // 0.1% buy + 0.1% sell for delivery
  stampDuty: number; // 0.015% buy only
  exchangeFees: number; // 0.00297% both legs
  sebiCharges: number; // ₹10 per crore (0.0001%)
  brokerage: number; // ₹0 or ₹40 round trip
  gst: number; // 18% on (brokerage + exchange + sebi)
  totalCost: number;
  total: number;
  costPercent: number; // totalCost / turnover
}

export interface CostBreakdown {
  total: number;
  totalCost?: number;
  stt: number;
  exchangeFees: number;
  stampDuty: number;
  gst: number;
  sebiCharges: number;
  brokerage: number;
}

export interface Trade {
  id: string;
  strategyId: StrategyType;
  ticker: string; // or "HDFCBANK / ICICIBANK" or "IT BASKET"
  symbol?: string;
  side: 'BUY' | 'SELL' | 'LONG_SPREAD' | 'SHORT_SPREAD' | string;
  entryDate: string;
  entryPrice: number;
  exitDate: string;
  exitPrice: number;
  quantity: number;
  shares?: number;
  holdingDays: number;
  grossPnl: number;
  grossPnlPercent: number;
  cost: TradeCost;
  netPnl: number;
  netPnlPercent: number;
  netReturnPct?: number;
  entryZScore?: number;
  exitZScore?: number;
  exitReason: string;
  legs?: {
    ticker: string;
    action: 'BUY' | 'SELL';
    price: number;
    weight: number;
  }[];
}

export interface DailyReturn {
  date: string;
  portfolioValue: number;
  dailyReturn: number;
  benchmarkValue: number;
  benchmarkReturn: number;
  drawdown: number;
  benchmarkDrawdown: number;
  openPositionsCount: number;
  cash: number;
}

export interface EquityCurvePoint {
  date: string;
  equity: number;
  benchmarkEquity: number;
  drawdownPct: number;
}

export interface SpreadPoint {
  date: string;
  spread: number;
  mean: number;
  zScore: number;
  upperBand?: number;
  lowerBand?: number;
  upperStop?: number;
  lowerStop?: number;
  tradeAction?: 'LONG' | 'SHORT' | 'EXIT' | 'STOP';
}

export interface MonthlyReturn {
  year: number;
  month?: number;
  returnPct?: number;
  months?: { [month: number]: number };
  annualTotal?: number;
}

export interface PerformanceStats {
  initialCapital: number;
  finalEquity: number;
  totalReturnPct: number;
  cagrPct: number;
  benchmarkTotalReturnPct: number;
  benchmarkCagrPct: number;
  annualizedVolatilityPct: number;
  benchmarkVolatilityPct: number;
  sharpeRatio: number; // vs 6.5% Rf
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdownPct: number;
  benchmarkMaxDrawdownPct: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePct: number;
  profitFactor: number;
  avgTradeNetPct: number;
  avgWinPct: number;
  avgLossPct: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  totalCostsPaid: number;
  costDragPct: number; // Impact of taxes & fees on return
  psrConfidence: number; // Probabilistic Sharpe Ratio (0.00 to 1.00)
  dsrConfidence: number; // Deflated Sharpe Ratio (0.00 to 1.00)
  alpha: number; // Jensen's Alpha annualized
  beta: number; // Beta vs NIFTY 50
  gatingPassed: boolean;
  gatingReason: string[];
}

export interface PairCandidate {
  pairId: string;
  stockA: string;
  stockB: string;
  sector: string;
  correlation: number;
  adfPValue: number; // Engle-Granger ADF test p-value (< 0.05 is cointegrated)
  halfLifeDays: number;
  hedgeRatio: number; // Beta
  currentZScore: number;
  isCointegrated: boolean;
}

export interface BasketCandidate {
  basketId: string;
  name: string;
  sector: string;
  tickers: string[];
  weights: number[];
  meanPairwiseCorrelation: number;
  halfLifeDays: number;
  currentZScore: number;
}

export interface BlueprintPhase {
  phase: number;
  title: string;
  scope: string;
  status: 'Done' | 'In progress' | 'Not started';
  files: string[];
  spotCheck: string;
  keyRule: string;
}

export interface SimulationResult {
  config: StrategyConfig;
  trades: Trade[];
  dailyReturns: DailyReturn[];
  monthlyReturns: MonthlyReturn[];
  equityCurve: EquityCurvePoint[];
  spreadPoints: SpreadPoint[];
  stats: PerformanceStats;
  totalCosts: CostBreakdown;
  dataSource?: DataSourceType;
  brokerCandlesCount?: number;
}

export type BacktestResult = SimulationResult;

export interface LeaderboardEntry {
  strategyId: StrategyType;
  strategyName: string;
  category: string;
  cagr: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  dsrScore: number;
  totalCostsPaid: number;
}
