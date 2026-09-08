# Nifty Quantitative Research & Point-in-Time Backtesting Terminal
### Institutional Backtesting & Strategy Lab for NSE India (with Zerodha Kite Connect v3 Integration)

A high-performance quantitative backtesting and algorithmic strategy research platform tailored for the **National Stock Exchange of India (NSE)**. Features point-in-time signal simulation, zero lookahead bias, tick-by-tick Indian regulatory transaction costs, multi-stock portfolio simulation, and a terminal CLI with one-command historical data ingestion via Zerodha Kite Connect v3 supporting **10, 20, or 30+ years of multi-decade historical backtesting**.

---

## Table of Contents
1. [Core Features & Architecture](#1-core-features--architecture)
2. [Multi-Decade Backtesting (10, 20, 30+ Years)](#2-multi-decade-backtesting-10-20-30-years)
3. [Zerodha Kite Connect v3 Setup Guide](#3-zerodha-kite-connect-v3-setup-guide)
   - [Step 1: Obtain Kite API Credentials](#step-1-obtain-kite-api-credentials)
   - [Step 2: Configure Local `.env`](#step-2-configure-local-env)
   - [Step 3: Generate Daily Session Token via CLI](#step-3-generate-daily-session-token-via-cli)
4. [One-Go Historical Data Downloader (`npm run kite:download`)](#4-one-go-historical-data-downloader-npm-run-kitedownload)
   - [Why Chunking is Required for 10–30 Years](#why-chunking-is-required-for-1030-years)
   - [Single-Command Execution Examples](#single-command-execution-examples)
   - [Command Options & Flags](#command-options--flags)
5. [Running Multi-Decade Backtests from the Terminal](#5-running-multi-decade-backtests-from-the-terminal)
   - [Backtest Commands by Time Horizon](#backtest-commands-by-time-horizon)
   - [30-Year Historical Regimes Simulated](#30-year-historical-regimes-simulated)
   - [Multi-Stock Portfolio Simulation Engine](#multi-stock-portfolio-simulation-engine)
6. [Supported NIFTY Universes (Up to NIFTY 500)](#6-supported-nifty-universes-up-to-nifty-500)
7. [Algorithmic Trading Strategies](#7-algorithmic-trading-strategies)
8. [Indian Regulatory Transaction Cost Ledger (NSE / SEBI)](#8-indian-regulatory-transaction-cost-ledger-nse--sebi)
9. [Quantitative Performance & Statistical Metrics](#9-quantitative-performance--statistical-metrics)
10. [Web Application & Live Dashboard](#10-web-application--live-dashboard)

---

## 1. Core Features & Architecture

- **Zero-Lookahead Point-in-Time Execution**: Strategy signals generate at **3:15 PM IST** using confirmed candle closes. Execution orders are simulated at **9:15 AM IST next morning's market Open**, eliminating synthetic fill bias.
- **Multi-Decade Continuous Horizon (10 to 30 Years)**: Backtest over 10, 20, or up to 30 years across the 2000 Dot-com crash, 2008 Lehman collapse, 2014 macro rally, 2020 COVID flash crash, and the 2021–2026 SIP liquidity bull run.
- **One-Go Historical Data Ingestion**: Automated chunked pagination script that bypasses Kite Connect's 365-day request limits and downloads decades of market data with rate limiting, retries, and pre-listing handling.
- **Multi-Stock Portfolio Mode**: When downloading an entire index (e.g. NIFTY 50 or NIFTY 500), the engine simulates concurrent multi-position allocations with strict portfolio capacity limits.
- **Statutory Cost Drag Modeling**: Every single trade deducts Securities Transaction Tax (STT), Stamp Duty, NSE Exchange Turnover charges, SEBI Turnover fees, and 18% GST tick-by-tick.
- **Deflated Sharpe Ratio (DSR)**: Incorporates Bailey & López de Prado's statistical framework to evaluate selection bias, track trial counts, and calculate true p-values against data snooping.
- **Bi-Modal Interface**: Full-featured interactive web dashboard (with Dark/Light themes, responsive Strategy Optimizer, and full-screen cards) + scriptable, headless CLI runner.

---

## 2. Multi-Decade Backtesting (10, 20, 30+ Years)

Backtesting over long horizons (10, 20, or 30 years) is the ultimate test of quantitative robusticity. A strategy that worked only during the 2020–2024 liquidity bull run may collapse during a sustained bear market or high-inflation regime.

### Why Long-Term Horizons Matter for Indian Equities:
- **10 Years (2016 – 2026)**: Tests Demonetization, GST introduction, 2018 NBFC crisis (IL&FS), 2020 COVID-19 crash, and the 2021–2026 domestic retail inflow supercycle.
- **20 Years (2006 – 2026)**: Includes the **2008 Global Financial Crisis** (NIFTY -60% drawdown), the 2009–2010 V-shaped recovery, the 2011–2013 European sovereign debt crisis, and the 2014 election rally.
- **30 Years (1996 – 2026)**: Spans the inception of the NIFTY 50 index (1996), the 2000 Dot-Com crash, the Ketan Parekh scam, the 2003–2007 golden capex bull market, and all subsequent cycles.

Both the historical data downloader (`npm run kite:download`) and the backtest engine (`npm run kite:backtest`) natively support arbitrary multi-decade horizons via the `--years` parameter.

---

## 3. Zerodha Kite Connect v3 Setup Guide

Zerodha Kite requires an active daily `access_token` generated via OAuth 2.0 with your personal developer credentials.

### Step 1: Obtain Kite API Credentials
1. Log in to the [Zerodha Developer Console](https://developers.kite.trade/apps).
2. Create a new app:
   - **App Name**: `Nifty Quant Terminal`
   - **Client ID**: Your Zerodha 6-character User ID (e.g. `AB1234`)
   - **Redirect URL**: `http://127.0.0.1:3000/api/kite/callback`
3. Copy your **API Key** (`api_key`) and **API Secret** (`api_secret`).

### Step 2: Configure Local `.env`
Create or edit your `.env` file in the root project folder:

```env
# Zerodha Kite Connect v3 Credentials
KITE_API_KEY="your_api_key_here"
KITE_API_SECRET="your_api_secret_here"
KITE_REDIRECT_URL="http://127.0.0.1:3000/api/kite/callback"
```

### Step 3: Generate Daily Session Token via CLI
Zerodha access tokens expire daily at 6:00 AM IST. Generate your daily session token with one command:

```bash
npm run kite:auth
```

The CLI will:
1. Print your official Zerodha login URL:
   ```
   https://kite.zerodha.com/connect/login?v=3&api_key=YOUR_KEY
   ```
2. Open the URL in your browser, log in with your credentials and TOTP.
3. After redirecting, copy the `request_token` parameter from your browser URL bar and paste it into the terminal prompt.
4. The CLI computes the SHA-256 checksum, verifies with Kite's token endpoint, and **automatically writes `KITE_ACCESS_TOKEN` into your `.env` file**.

*Alternatively, pass the request token directly in one line:*
```bash
npm run kite:auth -- --request-token YOUR_REQUEST_TOKEN_HERE
```

---

## 4. One-Go Historical Data Downloader (`npm run kite:download`)

### Why Chunking is Required for 10–30 Years
The Zerodha Kite Connect API enforces strict restrictions on historical candle requests:
- **Maximum 365 days** per single historical API call for daily candles.
- If you request 10 or 30 years in a single API call (e.g., `from=1996-01-01&to=2026-08-31`), the Kite API immediately rejects the request with an HTTP 400 error.
- Zerodha enforces a strict rate limit of **3 requests per second**. Exceeding it returns HTTP 429 Too Many Requests.
- Newer stocks (e.g., ZOMATO, PAYTM, TRENT, DMART) were listed recently; requesting data prior to their IPO date returns empty responses.

### How the Ingestor Solves This:
The built-in downloader script (`src/cli/downloadKiteData.ts`):
1. **Automatic Date Chunking**: Breaks any date range (10, 20, or 30 years) into sequential 365-day slices.
2. **Pre-Listing Graceful Handling**: Checks if a stock was not yet listed during older chunks and cleanly proceeds without error.
3. **Rate-Limit Throttling**: Enforces a polite 350ms throttle between calls (under Zerodha's 3 req/sec limit).
4. **Exponential Backoff**: Automatically retries up to 3 times on transient network errors or rate limit warnings.
5. **Deduplication & Sorting**: Merges all chunks chronologically, strips overlapping dates, and writes clean JSON files into `market_data_cache/`.
6. **Manifest Index**: Generates `market_data_cache/manifest.json` detailing start dates, end dates, candle counts, and latest prices.

### Single-Command Execution Examples

```bash
# 1. Download 20 years of daily data for all 50 stocks in NIFTY 50:
npm run kite:download -- --universe NIFTY_50 --years 20

# 2. Download 30 years of history for NIFTY 100:
npm run kite:download -- --universe NIFTY_100 --years 30

# 3. Download 10 years of data for NIFTY 500 (with limit for testing):
npm run kite:download -- --universe NIFTY_500 --years 10 --limit 30

# 4. Download 25 years for key market leaders:
npm run kite:download -- --symbols RELIANCE,TCS,INFY,HDFCBANK,ICICIBANK,ITC --years 25

# 5. Download exact historical date range for a single stock:
npm run kite:download -- --symbol RELIANCE --from 2000-01-01 --to 2026-08-31

# 6. Resume an interrupted download without re-fetching existing files:
npm run kite:download -- --universe NIFTY_500 --years 10 --resume
```

### Command Options & Flags

| Flag | Description | Default | Example |
|---|---|---|---|
| `--universe` | Target index universe | `NIFTY_50` | `--universe NIFTY_500` |
| `--symbol` | Single NSE ticker symbol | None | `--symbol RELIANCE` |
| `--symbols` | Comma-separated list of symbols | None | `--symbols TCS,INFY,LT` |
| `--years` | Number of years of history to download | `20` | `--years 30` |
| `--from` | Explicit start date (`YYYY-MM-DD`) | Auto from `--years` | `--from 2004-01-01` |
| `--to` | Explicit end date (`YYYY-MM-DD`) | Today | `--to 2026-08-31` |
| `--interval` | Candle interval (`day`, `60minute`, etc.) | `day` | `--interval day` |
| `--limit` | Limit number of stocks in universe | All | `--limit 25` |
| `--resume` | Skip symbols already cached on disk | False | `--resume` |
| `--chunk-days`| Number of days per pagination slice | `365` | `--chunk-days 365` |

---

## 5. Running Multi-Decade Backtests from the Terminal

Once historical data is cached in `market_data_cache/`, the backtest engine automatically detects and uses your local Kite data. If no cached data exists, it seamlessly falls back to high-fidelity calibrated institutional NSE market data.

### Backtest Commands by Time Horizon

```bash
# 10-Year Backtest (2016 – 2026) on NIFTY 50
npm run kite:backtest -- --strategy supertrend_swing --universe NIFTY_50 --years 10

# 20-Year Backtest (2006 – 2026) including the 2008 GFC
npm run kite:backtest -- --strategy donchian_breakout --universe NIFTY_50 --years 20

# 30-Year Backtest (1996 – 2026) covering entire modern NSE history
npm run kite:backtest -- --strategy golden_cross --universe NIFTY_50 --years 30

# Custom date range backtest on NIFTY 500 with ₹50 Lakhs capital
npm run kite:backtest -- --strategy rsi_pullback --universe NIFTY_500 --from 2008-01-01 --to 2026-08-31 --capital 5000000

# Statistical Arbitrage Pairs backtest over 15 years
npm run kite:backtest -- --strategy pairs_cointegration --pair HDFCBANK_ICICIBANK --years 15

# Export all trade entries, exits, and costs to CSV
npm run kite:backtest -- --strategy supertrend_swing --universe NIFTY_50 --years 20 --export-csv backtest_20yr.csv

# Output structured JSON for automated pipelines or optimization scripts
npm run kite:backtest -- --strategy donchian_breakout --universe NIFTY_50 --years 10 --format json
```

### 30-Year Historical Regimes Simulated

When running backtests over 10 to 30 years, the engine models authentic macroeconomic and market stress regimes:
1. **2000–2001 Dot-com Bust & Ketan Parekh Scam**: Extended bear market with negative drift and high volatility.
2. **2003–2007 Capex & Infrastructure Supercycle**: Unprecedented 5-year compounding bull run (NIFTY 1,000 → 6,100).
3. **2008 Global Financial Crisis (Lehman Collapse)**: -60% benchmark peak-to-trough crash with extreme volatility (VIX 60+).
4. **2009–2010 Post-GFC V-Shaped Liquidity Surge**: Rapid mean-reversion and high-beta breakout.
5. **2011–2013 European Debt Crisis & Taper Tantrum**: Rangebound consolidation with sharp currency devaluation.
6. **2014–2015 Reform & Election Rally**: Strong institutional momentum driven by foreign capital flows.
7. **2016 Demonetization & GST Dip**: Sharp temporary liquidity shock followed by swift recovery.
8. **2020 COVID-19 Flash Crash**: Historic -38% drop in 25 trading days followed by emergency central bank easing.
9. **2020–2021 Demat & Tech Supercycle**: Exponential retail participation and momentum leadership.
10. **2022 Geopolitical Rate-Hike Correction**: Global inflation shock, FII selling absorbed by domestic mutual funds.
11. **2023–2026 Domestic SIP Inflow Dominance**: Consistent DII liquidity driving structural outperformance across large and midcaps.

### Multi-Stock Portfolio Simulation Engine
When multiple stocks are present in `market_data_cache/`, the simulator runs a **multi-stock portfolio backtest**:
- Evaluates signals across all constituent stocks simultaneously.
- Dynamically allocates equal capital per position (`initialCapital / maxPositions`).
- Enforces a maximum position cap (default 4 concurrent positions) to prevent over-allocation.
- Computes aggregated portfolio equity curves, cash balances, and peak-to-trough drawdowns across the entire portfolio.

---

## 6. Supported NIFTY Universes (Up to NIFTY 500)

The engine provides verified Zerodha Kite instrument tokens for all major NSE indices:

### Broad Market Indices
| Index Identifier | Display Name | Constituents | Market Cap Tier | Description |
|---|---|---|---|---|
| `NIFTY_50` | NIFTY 50 | 50 | Large Cap Bluechips | India's benchmark top 50 companies by market cap & liquidity |
| `NIFTY_NEXT_50` | NIFTY Next 50 | 50 | Large Cap Growth | Companies ranked 51–100 by market capitalization |
| `NIFTY_100` | NIFTY 100 | 100 | Full Large Cap | Combined NIFTY 50 + NIFTY Next 50 universe |
| `NIFTY_200` | NIFTY 200 | 200 | Large & Midcap | Top 200 companies representing ~85% of total market cap |
| `NIFTY_500` | NIFTY 500 | 500 | Comprehensive Market | Full universe covering ~94% of total NSE free-float market cap |

### Midcap & Smallcap Indices
| Index Identifier | Display Name | Constituents | Description |
|---|---|---|---|
| `NIFTY_MIDCAP_50` | NIFTY Midcap 50 | 50 | Top 50 high-beta, liquid midcaps |
| `NIFTY_MIDCAP_100` | NIFTY Midcap 100 | 100 | Top 100 midcap stocks on NSE |
| `NIFTY_MIDCAP_150` | NIFTY Midcap 150 | 150 | Stocks ranked 101–250 by market cap |
| `NIFTY_SMALLCAP_50` | NIFTY Smallcap 50 | 50 | Top 50 emerging growth smallcaps |
| `NIFTY_SMALLCAP_100` | NIFTY Smallcap 100 | 100 | Liquid smallcaps ranked 251–350 |
| `NIFTY_SMALLCAP_250` | NIFTY Smallcap 250 | 250 | All smallcaps ranked 251–500 |

### Sectoral Indices
`NIFTY_BANK`, `NIFTY_IT`, `NIFTY_AUTO`, `NIFTY_PHARMA`, `NIFTY_FMCG`, `NIFTY_METAL`, `NIFTY_ENERGY`.

---

## 7. Algorithmic Trading Strategies

1. **Supertrend + 20 EMA Swing (`supertrend_swing`)**: Trend-following momentum system utilizing ATR trailing bands filtered by EMA slope.
2. **RSI Mean Reversion Pullback (`rsi_pullback`)**: Counter-trend dips to 25–35 RSI with 200 SMA structural trend confirmation.
3. **Golden Cross / Death Cross (`golden_cross`)**: Medium-to-long term regime shift detector using 50-day and 200-day exponential moving averages.
4. **Donchian Channel Breakout (`donchian_breakout`)**: Turtle-style channel breakouts across 20-day and 55-day local highs.
5. **BTST Overnight Momentum (`btst_momentum`)**: Buy Today Sell Tomorrow scanning 3:15 PM institutional volume surges, exiting at 9:15 AM Open.
6. **BTST Mean Reversion (`btst_reversal`)**: Overnight reversal capturing mean reversion on extreme intraday selloffs.
7. **Statistical Arbitrage Pairs (`pairs_cointegration`)**: Cointegrated pairs (e.g. HDFC Bank vs ICICI Bank, TCS vs Infosys) traded on Z-score spread divergence.
8. **Basket Mean Reversion (`basket_meanreversion`)**: Multi-asset synthetic portfolio tracking PCA-weighted sector spreads.

---

## 8. Indian Regulatory Transaction Cost Ledger (NSE / SEBI)

Indian quantitative equity strategies fail if transaction drag is ignored. Every single trade in this engine is deducted tick-by-tick against official statutory rates:

| Regulatory Line Item | Charge Structure | Regulatory Authority |
|---|---|---|
| **STT (Securities Transaction Tax)** | 0.1% on delivery (both Buy and Sell legs) | Department of Revenue (CBDT) |
| **Stamp Duty** | 0.015% (Buy leg only, ₹1,500 per Crore) | State / Stamp Act |
| **NSE Exchange Turnover Charge** | 0.00297% on executed turnover | National Stock Exchange |
| **SEBI Turnover Fee** | ₹10 per Crore turnover (0.0001%) | Securities & Exchange Board of India |
| **GST (Goods & Services Tax)** | 18% on (Brokerage + Exchange Fees + SEBI Fees) | Government of India |
| **Brokerage** | ₹0 on Delivery (Zerodha model) or flat ₹20/order | Broker schedule |
| **Execution Slippage** | 2 basis points (0.02%) on Next-Open fills | Market impact / Liquidity |

---

## 9. Quantitative Performance & Statistical Metrics

Each backtest produces an institutional summary:
- **CAGR (%)**: Compound Annual Growth Rate vs. NIFTY Benchmark CAGR.
- **Alpha (%)**: Excess annualized return above the index benchmark.
- **Beta**: Systematic covariance to NIFTY 50 price movements.
- **Sharpe Ratio**: Excess return over the Indian Risk-Free Rate ($R_f = 6.5\%$ 91-Day T-Bill yield).
- **Sortino Ratio**: Excess return divided exclusively by downside semi-deviation.
- **Calmar Ratio**: Annualized return divided by Maximum Peak-to-Trough Drawdown.
- **Maximum Drawdown (Max DD %)**: Deepest percentage fall from portfolio equity peak and duration in trading days.
- **Deflated Sharpe Ratio (DSR %)**: Calculates statistical significance under non-normal returns (skewness and kurtosis) and corrects for multiple testing / selection bias.
- **Profit Factor & Payoff Ratio**: Gross Profits / Gross Losses and Average Win / Average Loss ratio.

---

## 10. Web Application & Live Dashboard

To launch the interactive GUI with real-time charting, parameter sliders, Monte Carlo simulations, Strategy Optimizer, and Dark/Light visual themes:

```bash
# Start development server
npm run dev

# Open browser at:
http://localhost:3000
```

The web dashboard allows toggling between calibrated NSE historical data and Zerodha Kite broker connected sessions with one click, synchronizing data across the entire NIFTY universe up to NIFTY 500.

