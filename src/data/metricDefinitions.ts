export interface MetricBenchmarkTier {
  label: string;
  range: string;
  verdict: 'poor' | 'mediocre' | 'good' | 'elite';
  color: string;
  description: string;
}

export interface MetricDefinition {
  id: string;
  name: string;
  shortLabel: string;
  category: 'Risk' | 'Return' | 'Statistical' | 'Friction & Taxes' | 'Composite';
  formula: string;
  whatItMeasures: string;
  whatTheNumbersMean: string;
  ruleOfThumb: string;
  benchmarks: MetricBenchmarkTier[];
  indianMarketContext: string;
}

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  quant_score: {
    id: 'quant_score',
    name: 'Composite Quant Score',
    shortLabel: 'Quant Score',
    category: 'Composite',
    formula: 'Weighted Multi-Factor Model (Sharpe 25% + Calmar 20% + Sortino 15% + Win Rate 15% + DSR 15% - Tax Drag 10%)',
    whatItMeasures:
      'A holistic, institutional 0–100 index that measures the total robustness of a strategy across five dimensions: risk-adjusted drift, downside protection, statistical validity, psychological comfort, and tax efficiency under Indian delivery regulations.',
    whatTheNumbersMean:
      'A single overall health grade. High scores mean the strategy produces strong net returns while maintaining small drawdowns, low turnover friction, and high statistical reliability against curve-fitting.',
    ruleOfThumb:
      'Rule of thumb: Look for scores ≥ 75 for production swing trading on Nifty. Anything below 60 has either excessive drawdown, high tax bleed, or poor risk-adjusted returns.',
    benchmarks: [
      {
        label: 'Sub-Par / Fragile',
        range: '< 60',
        verdict: 'poor',
        color: 'rose',
        description: 'Poor balance. Characterized by high drawdowns, negative risk-adjusted returns, or severe tax drag.'
      },
      {
        label: 'Moderate / Tradable',
        range: '60 – 74',
        verdict: 'mediocre',
        color: 'amber',
        description: 'Decent performance, but vulnerable during sharp market corrections or choppy rangebound regimes.'
      },
      {
        label: 'Robust / High Quality',
        range: '75 – 84',
        verdict: 'good',
        color: 'emerald',
        description: 'Solid multi-factor balance. Strong Sharpe ratio, controlled drawdown (<15%), and healthy post-tax compound alpha.'
      },
      {
        label: 'Institutional / Elite',
        range: '85 – 100',
        verdict: 'elite',
        color: 'indigo',
        description: 'Top-tier quantitative profile. Exceptional Calmar ratio, high DSR overfit confidence, and minimal tax drag.'
      }
    ],
    indianMarketContext:
      'Calculated specifically for Indian retail trading on NSE. It penalizes frequent trading systems because Indian delivery STT (0.1% on buy and sell) rapidly erodes compounding if holding periods are too short.'
  },

  sharpe_ratio: {
    id: 'sharpe_ratio',
    name: 'Sharpe Ratio',
    shortLabel: 'Sharpe',
    category: 'Risk',
    formula: '(Annualized Strategy Return - Risk-Free Rate) / Annualized Volatility',
    whatItMeasures:
      'Measures the excess return generated per unit of total risk (standard deviation of daily portfolio equity). It tells you whether excess gains come from smart decision-making or simply taking on erratic volatility.',
    whatTheNumbersMean:
      'A Sharpe of 1.0 means you earned 1 unit of excess return above the risk-free rate for every 1 unit of portfolio volatility. A negative Sharpe indicates the strategy performed worse than risk-free government securities.',
    ruleOfThumb:
      'Rule of thumb: In Indian equities, a net Sharpe > 1.0 is solid, > 1.5 is very good, and > 2.0 is exceptional. Benchmarked against the Indian 10-Year Government Bond yield (6.5%).',
    benchmarks: [
      {
        label: 'Poor',
        range: '< 0.7',
        verdict: 'poor',
        color: 'rose',
        description: 'Inadequate risk compensation. You would be better off or safer in a fixed deposit or debt mutual fund.'
      },
      {
        label: 'Acceptable',
        range: '0.7 – 1.0',
        verdict: 'mediocre',
        color: 'amber',
        description: 'Average baseline for equity indices like Nifty 50. Generates positive alpha over bonds, but has noticeable volatility.'
      },
      {
        label: 'Good / Strong',
        range: '1.0 – 1.6',
        verdict: 'good',
        color: 'emerald',
        description: 'Strong quantitative trading performance. Generates consistent returns with contained standard deviation.'
      },
      {
        label: 'Elite / Masterful',
        range: '> 1.6',
        verdict: 'elite',
        color: 'indigo',
        description: 'Exceptional risk-adjusted drift. Always verify via the Deflated Sharpe Ratio to ensure it is not an artifact of overfitting.'
      }
    ],
    indianMarketContext:
      'Unlike US backtests that use a 2–4% Fed funds rate, Indian backtests must benchmark against the Reserve Bank of India (RBI) / 10-Year G-Sec yield (~6.5%). Earning 10% in India with high volatility is sub-par when risk-free debt yields 6.5–7.1%.'
  },

  sortino_ratio: {
    id: 'sortino_ratio',
    name: 'Sortino Ratio',
    shortLabel: 'Sortino',
    category: 'Risk',
    formula: '(Annualized Strategy Return - Risk-Free Rate) / Downside Deviation',
    whatItMeasures:
      'A refined variation of the Sharpe Ratio that penalizes ONLY downside (harmful) volatility, ignoring upside volatility. Since traders welcome sharp upside moves, Sortino provides a fairer evaluation of risk.',
    whatTheNumbersMean:
      'A higher Sortino ratio indicates the strategy captures upward market drift while insulating capital against steep cliff-edge drops.',
    ruleOfThumb:
      'Rule of thumb: Sortino should ideally be 20%–50% higher than your Sharpe ratio. Look for Sortino > 1.4 for reliable swing trading.',
    benchmarks: [
      {
        label: 'Poor',
        range: '< 1.0',
        verdict: 'poor',
        color: 'rose',
        description: 'Frequent downside spikes and sharp losses that harm compounding.'
      },
      {
        label: 'Acceptable',
        range: '1.0 – 1.4',
        verdict: 'mediocre',
        color: 'amber',
        description: 'Moderate downside protection. Standard for long-only momentum systems during corrections.'
      },
      {
        label: 'Good',
        range: '1.4 – 2.2',
        verdict: 'good',
        color: 'emerald',
        description: 'Strong asymmetrical risk profile: sharp upside participation with mild, well-cushioned drawdowns.'
      },
      {
        label: 'Exceptional',
        range: '> 2.2',
        verdict: 'elite',
        color: 'indigo',
        description: 'Superior defense. The strategy cuts losers rapidly while letting profitable trends compound.'
      }
    ],
    indianMarketContext:
      'Particularly critical during Indian market flash crashes (e.g. COVID March 2020 or election day volatility). High Sortino strategies preserve mental composure during NSE selloffs.'
  },

  dsr: {
    id: 'dsr',
    name: 'Deflated Sharpe Ratio (DSR)',
    shortLabel: 'DSR Overfit Test',
    category: 'Statistical',
    formula: 'PSR adjusted for Non-Normality, Skewness, Kurtosis, and Number of Strategy Trials (Marcos López de Prado, 2014)',
    whatItMeasures:
      'Measures the statistical probability that the strategy’s backtested Sharpe ratio is a genuine edge rather than the result of data snooping, lucky randomness, or repeated trial parameter optimization.',
    whatTheNumbersMean:
      'Expressed as a confidence percentage (0% to 100%). A DSR of 90% means there is a 90% statistical likelihood that the observed Sharpe ratio is not false discovery from testing many indicator combinations.',
    ruleOfThumb:
      'Rule of thumb: Institutional quants require DSR ≥ 80% (ideally ≥ 90%) before committing real trading capital. Never trade a strategy with DSR < 60% no matter how high its backtested CAGR appears.',
    benchmarks: [
      {
        label: 'High Overfitting Risk',
        range: '< 60%',
        verdict: 'poor',
        color: 'rose',
        description: 'Likely curve-fitted. Performance in live trading is very likely to deteriorate rapidly.'
      },
      {
        label: 'Borderline / Moderate',
        range: '60% – 79%',
        verdict: 'mediocre',
        color: 'amber',
        description: 'Moderate statistical significance. Requires larger trade sample size or out-of-sample forward testing.'
      },
      {
        label: 'Statistically Significant',
        range: '80% – 94%',
        verdict: 'good',
        color: 'emerald',
        description: 'Passed false-discovery checks. Real statistical edge confirmed after adjusting for fat tails and parameter trials.'
      },
      {
        label: 'Institutional Grade',
        range: '≥ 95%',
        verdict: 'elite',
        color: 'indigo',
        description: 'Highest econometric rigor. Very low probability of data snooping bias.'
      }
    ],
    indianMarketContext:
      'Many retail traders test 50 different indicator combinations on Nifty and pick the single highest CAGR without realizing they just found a random statistical anomaly. DSR mathematically filters out this illusion.'
  },

  max_drawdown: {
    id: 'max_drawdown',
    name: 'Maximum Drawdown (Max DD)',
    shortLabel: 'Max Drawdown',
    category: 'Risk',
    formula: '(Peak Portfolio Value - Trough Portfolio Value) / Peak Portfolio Value',
    whatItMeasures:
      'Measures the largest peak-to-valley percentage drop in your account balance before a new equity peak was reached. Represents the worst financial and emotional pain you would have experienced.',
    whatTheNumbersMean:
      'A Max Drawdown of -12% means that at the strategy’s worst historical point, an account of ₹10,00,000 temporarily dropped to ₹8,80,000 before recovering.',
    ruleOfThumb:
      'Rule of thumb: In equities, aim for Max DD < 15% (half of the Nifty 50 index’s historical -38% drop in 2020). Remember: a 50% loss requires a 100% gain just to break even!',
    benchmarks: [
      {
        label: 'Severe Pain',
        range: '> 25%',
        verdict: 'poor',
        color: 'rose',
        description: 'Dangerous capital erosion. Most retail traders abandon the strategy during such deep declines.'
      },
      {
        label: 'Moderate',
        range: '15% – 25%',
        verdict: 'mediocre',
        color: 'amber',
        description: 'Standard for aggressive trend-following, but requires strong psychological discipline to endure.'
      },
      {
        label: 'Controlled & Safe',
        range: '8% – 15%',
        verdict: 'good',
        color: 'emerald',
        description: 'Comfortable capital preservation. Far shallower than the broad Indian market crashes.'
      },
      {
        label: 'Impenetrable',
        range: '< 8%',
        verdict: 'elite',
        color: 'indigo',
        description: 'Exceptional defense. Typical of high-caliber pair-trading stat-arb or defensive multi-asset models.'
      }
    ],
    indianMarketContext:
      'During March 2020, Nifty 50 crashed -38.4%, and in 2008 it crashed -59.9%. A systematic strategy should protect your portfolio to less than half of that drawdown.'
  },

  calmar_ratio: {
    id: 'calmar_ratio',
    name: 'Calmar Ratio',
    shortLabel: 'Calmar',
    category: 'Risk',
    formula: 'Annualized CAGR (%) / Maximum Drawdown (%)',
    whatItMeasures:
      'Measures the relationship between annualized return and maximum drawdown risk. It answers: "How much annual profit did I receive for every percent of peak-to-valley drawdown I endured?"',
    whatTheNumbersMean:
      'If CAGR is 24% and Max Drawdown is 12%, Calmar is 2.0. If CAGR is 15% and Max Drawdown is 30%, Calmar is only 0.5.',
    ruleOfThumb:
      'Rule of thumb: Calmar > 1.0 is healthy, > 1.5 is strong, and > 2.5 is world-class. Hedge funds look closely at Calmar because it measures survival efficiency.',
    benchmarks: [
      {
        label: 'Weak Risk Reward',
        range: '< 0.8',
        verdict: 'poor',
        color: 'rose',
        description: 'You risked disproportionately large drawdowns to achieve mediocre returns.'
      },
      {
        label: 'Acceptable',
        range: '0.8 – 1.3',
        verdict: 'mediocre',
        color: 'amber',
        description: 'Standard market return-to-risk profile. Return roughly equals peak drawdown.'
      },
      {
        label: 'Solid Alpha',
        range: '1.4 – 2.2',
        verdict: 'good',
        color: 'emerald',
        description: 'Compelling strategy. Annual gains comfortably exceed the worst historical dip.'
      },
      {
        label: 'Outstanding',
        range: '> 2.2',
        verdict: 'elite',
        color: 'indigo',
        description: 'Elite asymmetric compounding: large positive drift with shallow drawdowns.'
      }
    ],
    indianMarketContext:
      'The Nifty 50 historical Calmar ratio over the last 15 years sits around 0.35 to 0.45 (13% CAGR with a -38% Max DD). A strategy with Calmar > 1.2 is dramatically outperforming buy-and-hold risk.'
  },

  cagr: {
    id: 'cagr',
    name: 'Compound Annual Growth Rate (CAGR)',
    shortLabel: 'CAGR',
    category: 'Return',
    formula: '((Final Net Equity / Initial Capital) ^ (1 / Years)) - 1',
    whatItMeasures:
      'The steady annual rate at which your portfolio grew over the multi-year backtesting window, assuming profits were continually reinvested and after deducting all brokerage and Indian taxes.',
    whatTheNumbersMean:
      'A 22% CAGR means your portfolio effectively grew at 22% year-over-year. Money doubles in ~3.3 years at 22% CAGR (Rule of 72).',
    ruleOfThumb:
      'Rule of thumb: Compare against Nifty 50 benchmark CAGR (~12–14%). Aim for net strategy CAGR ≥ 18–24% after all taxes to justify active systematic trading over a passive index ETF.',
    benchmarks: [
      {
        label: 'Below Benchmark',
        range: '< 12%',
        verdict: 'poor',
        color: 'rose',
        description: 'Underperformed passive Nifty 50 index investing. Active effort not justified.'
      },
      {
        label: 'Index Match',
        range: '12% – 16%',
        verdict: 'mediocre',
        color: 'amber',
        description: 'Competitive with Indian broad market index, but verify if drawdown was significantly lower.'
      },
      {
        label: 'Healthy Alpha',
        range: '17% – 26%',
        verdict: 'good',
        color: 'emerald',
        description: 'Outstanding retail alpha. Beats 90%+ of mutual funds after Indian delivery taxes.'
      },
      {
        label: 'Aggressive Compounder',
        range: '> 26%',
        verdict: 'elite',
        color: 'indigo',
        description: 'Rapid wealth multiplier. Check Max DD and DSR to verify robustness against market corrections.'
      }
    ],
    indianMarketContext:
      'In India, fixed deposits offer ~7% and long-term equity mutual funds deliver ~13–15%. A quantitative model should target 18%+ net after statutory friction to be worth executing.'
  },

  win_rate: {
    id: 'win_rate',
    name: 'Win Rate (%)',
    shortLabel: 'Win Rate',
    category: 'Return',
    formula: '(Number of Profitable Trades / Total Closed Trades) * 100',
    whatItMeasures:
      'The percentage of all closed trades that finished with a positive net profit after paying brokerage and Indian delivery taxes.',
    whatTheNumbersMean:
      'A 60% win rate means 6 out of every 10 trades make money, while 4 produce small losses.',
    ruleOfThumb:
      'Rule of thumb: Trend-following systems often work well with 45–55% win rates if their winners are twice as big as losers. Mean reversion and swing pullback systems typically target 60–75% win rates.',
    benchmarks: [
      {
        label: 'Low / Requires Big Winners',
        range: '< 45%',
        verdict: 'poor',
        color: 'rose',
        description: 'Hard to trade emotionally. Requires high payoff ratio (3:1 or 4:1) to remain profitable.'
      },
      {
        label: 'Balanced Trend Range',
        range: '45% – 55%',
        verdict: 'mediocre',
        color: 'amber',
        description: 'Standard for classic breakout/momentum strategies. Profitability hinges on trailing stop discipline.'
      },
      {
        label: 'High Accuracy',
        range: '56% – 70%',
        verdict: 'good',
        color: 'emerald',
        description: 'Emotionally reassuring for retail traders. Most trades end in profit.'
      },
      {
        label: 'Elite Accuracy',
        range: '> 70%',
        verdict: 'elite',
        color: 'indigo',
        description: 'Characteristic of statistical arbitrage, pair trading, and oversold dip-buying algorithms.'
      }
    ],
    indianMarketContext:
      'High win-rate strategies (65%+) provide huge psychological peace-of-mind for Indian retail traders who struggle to handle strings of consecutive losing trades.'
  },

  profit_factor: {
    id: 'profit_factor',
    name: 'Profit Factor (PF)',
    shortLabel: 'Profit Factor',
    category: 'Return',
    formula: 'Gross Profits (Sum of all winning trades) / Gross Losses (Sum of all losing trades)',
    whatItMeasures:
      'Measures the gross profitability efficiency of the system. For every ₹1 lost on bad trades, how many rupees did good trades generate?',
    whatTheNumbersMean:
      'A Profit Factor of 2.1 means the strategy generated ₹2.10 in gains for every ₹1.00 in losses.',
    ruleOfThumb:
      'Rule of thumb: Profit Factor < 1.0 is losing money. 1.2 – 1.6 is viable. > 1.8 is strong. > 2.5 is exceptional.',
    benchmarks: [
      {
        label: 'Unprofitable',
        range: '< 1.0',
        verdict: 'poor',
        color: 'rose',
        description: 'Total losses exceed total gains. The strategy loses money.'
      },
      {
        label: 'Break-even / Mediocre',
        range: '1.0 – 1.3',
        verdict: 'mediocre',
        color: 'amber',
        description: 'Thin margin of safety. Small slippage or extra broker fees could push it into loss.'
      },
      {
        label: 'Strong',
        range: '1.4 – 2.0',
        verdict: 'good',
        color: 'emerald',
        description: 'Healthy trading engine. Wins reliably outweigh losses by a 1.5x margin.'
      },
      {
        label: 'Elite Machine',
        range: '> 2.0',
        verdict: 'elite',
        color: 'indigo',
        description: 'Exceptional payoff efficiency with low tail risk.'
      }
    ],
    indianMarketContext:
      'Ensure Profit Factor is calculated after deducting the 0.1% STT on both legs, otherwise gross profit factor will mislead you.'
  },

  cost_drag: {
    id: 'cost_drag',
    name: 'Statutory Tax & Friction Drag (%)',
    shortLabel: 'Tax Drag %',
    category: 'Friction & Taxes',
    formula: '(Total Brokerage + STT + SEBI + GST + Stamp Duty) / Initial Capital * 100',
    whatItMeasures:
      'Measures how much of your starting capital was consumed by Indian Government taxes, exchange charges, and broker fees over the backtest period.',
    whatTheNumbersMean:
      'A drag of 4.2% means out of ₹10,00,000 capital, ₹42,000 was paid in total statutory friction across all trade fills.',
    ruleOfThumb:
      'Rule of thumb: Delivery swing systems should keep annual friction drag < 2–4%. Scalping or hyperactive models that drag 15%+ will cause massive compounding drag.',
    benchmarks: [
      {
        label: 'Excessive Friction Bleed',
        range: '> 10%',
        verdict: 'poor',
        color: 'rose',
        description: 'Hyperactive churn. Government and brokers are taking an excessive bite of your wealth.'
      },
      {
        label: 'Moderate Friction',
        range: '5% – 10%',
        verdict: 'mediocre',
        color: 'amber',
        description: 'Manageable, but indicates relatively high turnover or shorter holding periods.'
      },
      {
        label: 'Efficient Turnover',
        range: '2% – 5%',
        verdict: 'good',
        color: 'emerald',
        description: 'Healthy balance between trade reactivity and tax preservation.'
      },
      {
        label: 'Ultra Low Drag',
        range: '< 2%',
        verdict: 'elite',
        color: 'indigo',
        description: 'Near-zero tax friction. Typical of patient swing or long-term multi-week trend followers.'
      }
    ],
    indianMarketContext:
      'In India, Securities Transaction Tax (STT) is 0.1% on delivery buys AND 0.1% on delivery sells. That is a guaranteed 0.2% statutory tax haircut per round-trip trade, making turnover control essential.'
  },

  cost_to_profit: {
    id: 'cost_to_profit',
    name: 'Cost-to-Profit Ratio (%)',
    shortLabel: 'Cost-to-Profit',
    category: 'Friction & Taxes',
    formula: '(Total Taxes & Fees / Total Net Trading Profits) * 100',
    whatItMeasures:
      'Shows the exact percentage of your hard-earned trading profits that was absorbed by the Government of India, NSE, SEBI, and your broker.',
    whatTheNumbersMean:
      'If you earned ₹2,00,000 net profit and paid ₹20,000 in STT/fees, your cost-to-profit ratio is 10%.',
    ruleOfThumb:
      'Rule of thumb: Strive to keep Cost-to-Profit < 12%. If it exceeds 25%, you are working primarily for the tax authorities and broker.',
    benchmarks: [
      {
        label: 'Predatory Bleed',
        range: '> 25%',
        verdict: 'poor',
        color: 'rose',
        description: 'Over a quarter of your trading gains are lost to taxes and charges.'
      },
      {
        label: 'Average',
        range: '12% – 25%',
        verdict: 'mediocre',
        color: 'amber',
        description: 'Common for short-term swing models, but leaves room for optimization.'
      },
      {
        label: 'Tax-Frugal',
        range: '5% – 12%',
        verdict: 'good',
        color: 'emerald',
        description: 'Very efficient. 90%+ of gross market gains remain in your pocket.'
      },
      {
        label: 'Institutional Purity',
        range: '< 5%',
        verdict: 'elite',
        color: 'indigo',
        description: 'Minimal friction. Maximum compounding power.'
      }
    ],
    indianMarketContext:
      'Active Indian options traders often suffer cost-to-profit ratios of 30–50%. Systematic delivery swing trading on Nifty bluechips dramatically reduces this ratio.'
  },

  avg_holding_days: {
    id: 'avg_holding_days',
    name: 'Average Holding Duration (Days)',
    shortLabel: 'Avg Holding Period',
    category: 'Return',
    formula: 'Sum of holding days across all closed trades / Total number of closed trades',
    whatItMeasures:
      'The typical time a position remains open in the market before hitting a profit target, moving average cross, or stop-loss.',
    whatTheNumbersMean:
      'An average of 14 days means your trades typically mature over 2 to 3 trading weeks.',
    ruleOfThumb:
      'Rule of thumb: Delivery swing trading works best with 5 to 25 holding days. Shorter (< 2 days) suffers from delivery STT overhead; longer (> 60 days) can become dead money during sideways markets.',
    benchmarks: [
      {
        label: 'Hyper Short / Intraday Swing',
        range: '< 3 days',
        verdict: 'mediocre',
        color: 'amber',
        description: 'High transaction frequency. STT charges eat into compounding.'
      },
      {
        label: 'Sweetspot Swing',
        range: '5 – 25 days',
        verdict: 'good',
        color: 'emerald',
        description: 'Optimal retail swing window. Captures 5–15% moves while amortizing delivery taxes.'
      },
      {
        label: 'Position / Trend Following',
        range: '25 – 60 days',
        verdict: 'elite',
        color: 'indigo',
        description: 'Rides major structural trends with tiny turnover friction.'
      },
      {
        label: 'Buy & Hold / Extended',
        range: '> 60 days',
        verdict: 'mediocre',
        color: 'amber',
        description: 'Very low turnover, but exposes capital to prolonged consolidation lulls.'
      }
    ],
    indianMarketContext:
      'Holding delivery shares past T+1 day in India qualifies for delivery accounting and avoids intraday margin squared-off restrictions.'
  }
};
