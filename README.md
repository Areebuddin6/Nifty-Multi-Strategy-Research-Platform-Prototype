# Nifty Quantitative Research & Point-in-Time Backtesting Platform
### Institutional Multi-Decade Algorithmic Trading Lab for NSE India (Zerodha Kite Connect v3 Integration)

A high-performance quantitative backtesting and algorithmic strategy research platform tailored specifically for the **National Stock Exchange of India (NSE)**. Features point-in-time signal simulation, zero lookahead bias, tick-by-tick Indian regulatory transaction costs, multi-stock portfolio simulation, and a dedicated suite of one-go terminal CLI scripts and interactive UI controls supporting **10, 20, or 30+ years of continuous multi-decade historical backtesting** via Zerodha Kite Connect v3.

---

## Quick Navigation & Table of Contents
1. [Executive Summary & Core Architecture](#1-executive-summary--core-architecture)
2. [Multi-Decade Backtesting (10, 20, 30+ Years)](#2-multi-decade-backtesting-10-20-30-years)
3. [Zerodha Kite Connect v3 API Setup Guide](#3-zerodha-kite-connect-v3-api-setup-guide)
   - [Step 1: Obtain Kite Developer Credentials](#step-1-obtain-kite-developer-credentials)
   - [Step 2: Configure Local `.env`](#step-2-configure-local-env)
   - [Step 3: Generate Daily Session Access Token](#step-3-generate-daily-session-access-token)
4. [One-Go Historical Data Downloader Guide](#4-one-go-historical-data-downloader-guide)
   - [The 365-Day API Limit & Why Chunking is Mandatory](#the-365-day-api-limit--why-chunking-is-mandatory)
   - [One-Command Quick Presets (10Y, 20Y, 30Y)](#one-command-quick-presets-10y-20y-30y)
   - [All-in-One Runner Script (`npm run kite:one-go` / `./download_kite_data.sh`)](#all-in-one-runner-script-npm-run-kiteone-go--download_kite_datash)
   - [Full CLI Options & Flags](#full-cli-options--flags)
5. [How to Backtest for Different Time Periods](#5-how-to-backtest-for-different-time-periods)
   - [Running Backtests in the Terminal (CLI)](#running-backtests-in-the-terminal-cli)
   - [Running Backtests in the Interactive Web Dashboard (UI)](#running-backtests-in-the-interactive-web-dashboard-ui)
   - [30-Year Macroeconomic Stress Regimes Simulated (1996–2026)](#30-year-macroeconomic-stress-regimes-simulated-19962026)
6. [Supported NIFTY Universes (NIFTY 50 to NIFTY 500)](#6-supported-nifty-universes-nifty-50-to-nifty-500)
7. [Algorithmic Trading Strategies Catalogue](#7-algorithmic-trading-strategies-catalogue)
8. [Indian Regulatory Transaction Cost Ledger (NSE / SEBI)](#8-indian-regulatory-transaction-cost-ledger-nse--sebi)
9. [Statistical Evaluation & Overfitting Protection (DSR)](#9-statistical-evaluation--overfitting-protection-dsr)
10. [Local Development, Caching & Architecture](#10-local-development-caching--architecture)
11. [Troubleshooting & Frequently Asked Questions (FAQ)](#11-troubleshooting--frequently-asked-questions-faq)

---

## 1. Executive Summary & Core Architecture

Quantitative trading strategies that look phenomenal in short-term backtests frequently blow up in real life due to three common pitfalls: **lookahead bias**, **unrealistic fill assumptions**, and **ignoring Indian statutory cost drag**. This platform solves all three:

- **Point-in-Time Signal Generation (3:15 PM IST)**: Indicators and trade signals are evaluated exclusively using confirmed daily closes at 3:15 PM IST.
- **Realistic Next-Open Execution (9:15 AM IST)**: Trades execute at the next trading morning's official NSE opening price, eliminating artificial same-day close fill bias.
- **Tick-by-Tick Statutory Taxation**: Deducts STT (Securities Transaction Tax), Stamp Duty, NSE Exchange Turnover charges, SEBI Turnover fees, and 18% GST on every executed leg.
- **Multi-Stock Portfolio Simulation**: Dynamically allocates capital across up to 500 constituent stocks with position sizing constraints and concurrent capacity caps.
- **Multi-Decade Continuum**: Supports continuous backtesting across 10, 20, or up to 30 years (from 1996 to 2026).
- **Offline-First Data Caching**: Ingests and stores clean, split-adjusted daily candles into `market_data_cache/` so subsequent backtests run offline in milliseconds.

---

## 2. Multi-Decade Backtesting (10, 20, 30+ Years)

Backtesting over 10, 20, or 30 years is crucial for discovering whether a strategy has genuine edge or was merely overfitted to the 2020–2024 post-COVID liquidity bull market.

### Why Different Time Horizons Matter for Indian Equities:

| Horizon | Date Span | Primary Market Regimes Included | Why You Must Test It |
|---|---|---|---|
| **10 Years** | 2016 – 2026 | 2016 Demonetization, 2017 GST rollout, 2018 IL&FS credit crisis, 2020 COVID flash crash, 2021–2026 retail SIP supercycle | Demonstrates performance in the modern electronic trading era with strong domestic mutual fund flows. |
| **20 Years** | 2006 – 2026 | **2008 Lehman GFC Crash (-60% NIFTY drawdown)**, 2009–2010 V-shaped recovery, 2011–2013 European sovereign debt crisis & Taper Tantrum, 2014 Modi election rally | Tests if your risk management and stop-loss logic can survive the worst systemic global liquidity crash in modern history without ruin. |
| **30 Years** | 1996 – 2026 | Inception of NIFTY 50 (1996), 2000 Dot-Com crash, 2001 Ketan Parekh scam, 2003–2007 Golden Capex Supercycle (Nifty 1,000 → 6,100), plus all cycles above | Max available modern NSE historical data. Validates strategy robustness across full economic, interest rate, and commodity supercycles. |

Both the historical data downloader (`src/cli/downloadKiteData.ts`) and the backtest engines natively support arbitrary multi-decade spans via the `--years` parameter or through the web dashboard.

---

## 3. Zerodha Kite Connect v3 API Setup Guide

Zerodha Kite Connect v3 requires an **API Key**, **API Secret**, and a daily **Session Access Token** generated via OAuth 2.0.

### Step 1: Obtain Kite Developer Credentials
1. Visit the [Zerodha Developer Portal](https://developers.kite.trade/apps) and create a developer account.
2. Click **Create New App**:
   - **App Name**: `Nifty Quant Terminal`
   - **Client ID**: Your Zerodha 6-character Trading ID (e.g. `AB1234`)
   - **Redirect URL**: `http://127.0.0.1:3000/api/kite/callback` *(Note: this can also be localhost)*
3. After creation, copy your **API Key** (`api_key`) and **API Secret** (`api_secret`).

### Step 2: Configure Local `.env`
Create or edit `.env` in the root of your project:

```env
# Zerodha Kite Connect v3 Credentials
KITE_API_KEY="your_api_key_here"
KITE_API_SECRET="your_api_secret_here"
KITE_REDIRECT_URL="http://127.0.0.1:3000/api/kite/callback"

# Optional: will be auto-generated by the CLI helper
KITE_ACCESS_TOKEN=""
```

### Step 3: Generate Daily Session Access Token
Zerodha access tokens expire daily at **6:00 AM IST** as mandated by Indian exchange security regulations.

Generate your token in one automated terminal command:

```bash
npm run kite:auth
```

**How the automated generator works:**
1. The CLI displays your personalized Zerodha authentication URL:
   ```
   https://kite.zerodha.com/connect/login?v=3&api_key=YOUR_API_KEY
   ```
2. Open the URL in your browser, log in with your Zerodha Client ID, password, and 2FA TOTP.
3. Upon login, your browser redirects to your configured URL:
   ```
   http://127.0.0.1:3000/api/kite/callback?request_token=XXXXXX&action=login&status=success
   ```
4. Copy the `request_token` parameter from your browser URL bar and paste it into the terminal prompt.
5. The CLI automatically calculates the SHA-256 checksum (`SHA256(api_key + request_token + api_secret)`), exchanges it with Zerodha's session endpoint, and **automatically updates `KITE_ACCESS_TOKEN` inside your `.env` file**!

*Pro-tip: You can also pass the token in one line:*
```bash
npm run kite:auth -- --request-token YOUR_REQUEST_TOKEN_HERE
```

---

## 4. One-Go Historical Data Downloader Guide

### The 365-Day API Limit & Why Chunking is Mandatory
If you attempt to query Zerodha Kite for 10, 20, or 30 years of daily candles in a single request (e.g., `from=1996-01-01&to=2026-08-31`), **the Kite API rejects the request with an HTTP 400 Bad Request error**.

Zerodha strictly enforces:
- **Maximum 365 days** per historical query for daily candles.
- **3 requests per second** rate limit across the entire account.
- **IPO listing dates**: Requesting dates prior to an equity's IPO date (e.g., ZOMATO prior to July 2021) returns 400/empty data.

### How Our Downloader Solves This Automatically:
1. **Mathematical Date Slicing**: Automatically slices your requested multi-decade span into consecutive ~365-day slices.
2. **Pre-Listing Detection**: If an instrument was listed in e.g. 2018, older chunk slices (1996–2017) are safely detected and skipped without throwing errors or breaking the download loop.
3. **Paced Rate Throttling**: Enforces an exact 350ms delay between consecutive requests, guaranteeing you remain safely below Zerodha's 3 req/sec cap.
4. **Resilient Retry Mechanism**: Employs exponential backoff (up to 3 retries) on network blips or temporary HTTP 429 warnings.
5. **Disk Caching**: Merges all chunks chronologically, deduplicates timestamps, and writes clean JSON files into `market_data_cache/` (e.g. `RELIANCE_day.json`, `NIFTY 50_day.json`).

---

### One-Command Quick Presets (10Y, 20Y, 30Y)

You can download data in one go using our pre-configured npm scripts:

```bash
# Download 10 Years (2016–2026) for NIFTY 50:
npm run kite:download:10y

# Download 20 Years (2006–2026 • Covers 2008 Lehman GFC) for NIFTY 50:
npm run kite:download:20y

# Download 30 Years (1996–2026 • Maximum available NSE history) for NIFTY 50:
npm run kite:download:30y
```

---

### All-in-One Runner Script (`npm run kite:one-go` / `./download_kite_data.sh`)

If you want to execute everything in a **single seamless pipeline** (check token -> prompt if missing -> download multi-decade history -> run backtest -> print institutional report), use `kite:one-go`:

```bash
# Run with default 20-year horizon:
npm run kite:one-go

# Run 30-Year pipeline on NIFTY 50 with Golden Cross strategy:
npm run kite:one-go -- --years 30 --strategy golden_cross

# Run 10-Year pipeline on NIFTY 100 with RSI Pullback strategy:
npm run kite:one-go -- --years 10 --universe NIFTY_100 --strategy rsi_pullback

# Test with first 15 stocks and export trades to CSV:
npm run kite:one-go -- --years 20 --limit 15 --export-csv trades_20y.csv
```

Alternatively, you can run the standalone bash script:
```bash
# Format: ./download_kite_data.sh [YEARS] [UNIVERSE] [LIMIT]
./download_kite_data.sh 30
./download_kite_data.sh 20 NIFTY_50
./download_kite_data.sh 10 NIFTY_100 20
```

---

### Full CLI Options & Flags

The downloader accepts extensive customization:

```bash
npm run kite:download -- [options]
```

| Flag | Description | Default | Example |
|---|---|---|---|
| `--universe` | Target index universe | `NIFTY_50` | `--universe NIFTY_100` |
| `--years` | Number of years of history to download | `20` | `--years 30` |
| `--symbol` | Download a single stock ticker | None | `--symbol RELIANCE` |
| `--symbols` | Comma-separated list of stocks | None | `--symbols TCS,INFY,HDFCBANK,ITC` |
| `--from` | Explicit start date (`YYYY-MM-DD`) | Derived from `--years` | `--from 2000-01-01` |
| `--to` | Explicit end date (`YYYY-MM-DD`) | Today | `--to 2026-08-31` |
| `--interval` | Candle resolution (`day`, `60minute`, etc.) | `day` | `--interval day` |
| `--limit` | Limit number of stocks (for rapid tests) | All | `--limit 10` |
| `--resume` | Skip instruments already present in cache | False | `--resume` |
| `--chunk-days` | Number of days per pagination chunk | `365` | `--chunk-days 365` |

**Example: Downloading 30 years of history for top bluechips:**
```bash
npm run kite:download -- --symbols RELIANCE,TCS,INFY,HDFCBANK,ICICIBANK,ITC,LT,SBIN --years 30
```

---

## 5. How to Backtest for Different Time Periods

Once historical data is downloaded to `market_data_cache/`, you can run backtests across any time period in two ways: via the **Terminal CLI** or the **Interactive Web Dashboard**.

### Running Backtests in the Terminal (CLI)

Use our pre-configured time horizon scripts:

```bash
# 10-Year Backtest (2016–2026):
npm run kite:backtest:10y

# 20-Year Backtest (2006–2026 • includes 2008 Lehman crash):
npm run kite:backtest:20y

# 30-Year Backtest (1996–2026 • full modern NSE history):
npm run kite:backtest:30y
```

Or customize with parameters:
```bash
# 30-Year Donchian Breakout on NIFTY 50:
npm run kite:backtest -- --strategy donchian_breakout --universe NIFTY_50 --years 30

# 20-Year Supertrend Swing with ₹25 Lakhs initial capital:
npm run kite:backtest -- --strategy supertrend_swing --universe NIFTY_50 --years 20 --capital 2500000

# 15-Year Statistical Arbitrage Pairs on HDFC Bank vs ICICI Bank:
npm run kite:backtest -- --strategy pairs_cointegration --pair HDFCBANK_ICICIBANK --years 15

# Export full trade logs to CSV for Excel / Python analysis:
npm run kite:backtest -- --strategy supertrend_swing --years 20 --export-csv results_20yr.csv

# Output machine-readable JSON:
npm run kite:backtest -- --strategy rsi_pullback --years 10 --format json
```

---

### Running Backtests in the Interactive Web Dashboard (UI)

1. Launch the application:
   ```bash
   npm run dev
   ```
2. Open your browser at `http://localhost:3000`.
3. In the **Strategy Configuration Panel**, find the **Historical Backtest Horizon** section:
   - **Quick Presets**: Click any preset pill:
     - `30 Years (1996–2026)` • Full NSE History
     - `20 Years (2006–2026)` • Includes 2008 GFC
     - `10 Years (2016–2026)` • DeMon & COVID
     - `5 Years (2020–2026)` • COVID Supercycle
     - `3 Years (2023–2026)` • High-Rate Regime
   - **Custom Date Pickers**: Tune exact `Start Date` and `End Date` inputs.
   - **Macro Regime Badges**: The panel dynamically highlights which historical market stress periods are active in your selected window (e.g. *2000 Dot-com*, *2008 Lehman GFC*, *2016 DeMon*, *2020 COVID*).
4. Click **Run Simulation** to recalculate the equity curve, drawdown dynamics, and monthly heatmaps instantly!

---

### Top Strategy Finder (Strategy Optimizer) with Multi-Decade Horizon

The **Top Strategy Finder** (`Optimizer` tab) evaluates mathematical parameter permutations across all systematic trading models and ranks candidates using composite quant scores, Sharpe ratio, Calmar ratio, win rate, and Indian statutory tax drag.

#### Why the Historical Horizon is Critical in the Strategy Finder:
In quantitative finance, evaluating models across different time horizons is essential to avoid **recency bias**:
- **5-Year Horizon (2020–2026)**: In the post-COVID liquidity supercycle with massive retail SIP inflows, aggressive trend breakout and momentum models often dominate returns.
- **20 to 30-Year Horizons (1996–2026 / 2006–2026)**: When the dataset encompasses the 2000 Dot-Com crash (-50%), 2008 Lehman GFC (-60%), and the 2011–2013 European debt crisis, conservative models with defensive drawdown containment, wider confirmation windows, or statistical arbitrage pairs rank highest on risk-adjusted Calmar and Deflated Sharpe metrics.

#### Top Strategy Finder Horizon Features:
- **Horizon Presets**: Instantly sweep candidate grids across `30Y`, `20Y`, `10Y`, `5Y`, or `3Y` periods directly within the Strategy Finder.
- **Point-in-Time Stress Badges**: Visual indicators reveal which historical crises are tested during the optimization.
- **Synchronized One-Click Loading**: Clicking **"Load Strategy into Backtester"** on any ranked recommendation automatically transfers the optimal strategy, variation, confirmation window, **and the active backtest horizon** directly into the execution backtest tab.

---

### Smooth Theme Transitions (Dark & Light Mode)

The interface supports both institutional dark mode and crisp light mode:
- **Hardware-Accelerated Transitions**: All cards, borders, text hierarchies, modals, and container backgrounds utilize a unified 280ms cubic-bezier (`cubic-bezier(0.4, 0, 0.2, 1)`) transition curve.
- **Flicker-Free Theme Toggling**: Eliminates abrupt background flashes and harsh repaints, delivering a smooth transition when switching themes.

---

### 30-Year Macroeconomic Stress Regimes Simulated (1996–2026)

When testing across 10 to 30 years, the engine models the following market dynamics:

1. **1996–1999 Inception Era**: NIFTY 50 starts at 1,000 base points; initial liquidity formation and screen-based trading adoption.
2. **2000–2002 Dot-Com Bust & Ketan Parekh Scam**: Sustained bear market with -50% peak-to-trough decline and ICE (Info-Comm-Ent) sector liquidation.
3. **2003–2007 Golden Capex Supercycle**: Unprecedented 5-year compounding economic expansion (Nifty 1,100 → 6,100) driven by corporate capex and infrastructure.
4. **2008 Global Financial Crisis (Lehman Collapse)**: Violent -60% benchmark plunge with VIX surging above 60.
5. **2009–2010 V-Shaped Liquidity Recovery**: High-beta surge driven by global central bank easing.
6. **2011–2013 European Debt Crisis & Taper Tantrum**: Rangebound market with sharp INR depreciation and policy paralysis.
7. **2014–2015 Reform & Election Rally**: Massive foreign institutional investor (FII) inflows leading to secular breakout.
8. **2016 Demonetization & 2017 GST Transition**: Sharp temporary liquidity shock followed by formalization of the Indian economy.
9. **2018 NBFC Crisis (IL&FS Default)**: Severe midcap and smallcap bear market while largecap indices remained narrow.
10. **2020 COVID-19 Flash Crash**: Violent -38% drop in 25 trading sessions followed by the fastest monetary-driven recovery in history.
11. **2021–2026 Domestic SIP Inflow Supercycle**: Retail participation via mutual fund SIPs (reaching ₹20,000+ Crore/month) transforming Indian equities into a domestic liquidity stronghold.

---

## 6. Supported NIFTY Universes (NIFTY 50 to NIFTY 500)

The platform includes verified Zerodha Kite Connect instrument tokens and constituents for:

| Index Identifier | Display Name | Constituents | Market Cap Category |
|---|---|---|---|
| `NIFTY_50` | NIFTY 50 | 50 | India's premier top 50 bluechips (Token: `256265`) |
| `NIFTY_NEXT_50` | NIFTY Next 50 | 50 | Largecaps ranked 51–100 (Token: `261897`) |
| `NIFTY_100` | NIFTY 100 | 100 | Combined broad large-cap basket (Token: `258569`) |
| `NIFTY_200` | NIFTY 200 | 200 | Top 200 liquid enterprises (Token: `260361`) |
| `NIFTY_500` | NIFTY 500 | 500 | Comprehensive market coverage ~94% of NSE free-float (Token: `257801`) |
| `NIFTY_MIDCAP_50` | NIFTY Midcap 50 | 50 | High-beta mid-cap enterprises (Token: `260873`) |
| `NIFTY_MIDCAP_100`| NIFTY Midcap 100 | 100 | Standard mid-cap institutional benchmark (Token: `260617`) |
| `NIFTY_MIDCAP_150`| NIFTY Midcap 150 | 150 | Midcaps ranked 101–250 (Token: `266249`) |
| `NIFTY_SMALLCAP_50` | NIFTY Smallcap 50 | 50 | Fast-growing emerging smallcaps (Token: `266505`) |
| `NIFTY_SMALLCAP_100`| NIFTY Smallcap 100 | 100 | Liquid smallcap index (Token: `265737`) |
| `NIFTY_SMALLCAP_250`| NIFTY Smallcap 250 | 250 | Smallcaps ranked 251–500 (Token: `267017`) |
| **Sectorals** | `NIFTY_BANK`, `NIFTY_IT`, `NIFTY_AUTO`, `NIFTY_PHARMA`, `NIFTY_FMCG`, `NIFTY_METAL`, `NIFTY_ENERGY` | 10–15 each | Key industry leaders |

---

## 7. Algorithmic Trading Strategies Catalogue

The platform features 8 fully implemented quantitative strategies:

1. **Supertrend + 200 EMA Swing (`supertrend_swing`)**:
   - *Logic*: Trend-following system combining ATR trailing band volatility with 200 EMA structural regime filtering.
   - *Entry*: Supertrend turns bullish and Price > 200 EMA.
   - *Exit*: Supertrend flips bearish or trailing ATR stop hit.

2. **RSI Oversold Pullback (`rsi_pullback`)**:
   - *Logic*: High-probability mean-reversion buying institutional dips in secular uptrends.
   - *Entry*: 14-day RSI drops below 30 while Price remains above 200 EMA.
   - *Exit*: RSI crosses above 60 or fixed holding period elapsed.

3. **50 EMA x 200 EMA Golden Cross (`golden_cross`)**:
   - *Logic*: Classical medium-to-long term momentum regime shift detector.
   - *Entry*: Fast 50-day EMA crosses above Slow 200-day EMA.
   - *Exit*: Death Cross (50 EMA crosses below 200 EMA).

4. **Donchian Breakout (`donchian_breakout`)**:
   - *Logic*: Turtle Trading trend breakout model.
   - *Entry*: Breakout above the rolling 20-day high.
   - *Exit*: Break below the rolling 10-day low.

5. **BTST Overnight Momentum (`btst_momentum`)**:
   - *Logic*: Buy Today Sell Tomorrow scanning 3:15 PM institutional volume surges.
   - *Entry*: 3:15 PM confirmed top gainer in universe.
   - *Exit*: 9:15 AM next-morning market Open.

6. **BTST Dip Reversal (`btst_reversal`)**:
   - *Logic*: Overnight mean-reversion capturing extreme afternoon panic selling.
   - *Entry*: 3:15 PM oversold extreme with positive divergence.
   - *Exit*: 9:15 AM next-morning market Open.

7. **Statistical Arbitrage Pairs (`pairs_cointegration`)**:
   - *Logic*: Engle-Granger Augmented Dickey-Fuller (ADF) cointegration on correlated twins (e.g. HDFC Bank vs ICICI Bank, TCS vs Infosys).
   - *Entry*: Rolling spread Z-score exceeds $\pm 2.0$.
   - *Exit*: Mean-reversion to Z-score $= 0.0$ or stop-loss at $\pm 3.5$.

8. **Basket Mean Reversion (`basket_meanreversion`)**:
   - *Logic*: Multi-asset synthetic portfolio tracking PCA-weighted sector spreads (e.g. Private Banks Basket, IT Majors Basket).

---

## 8. Indian Regulatory Transaction Cost Ledger (NSE / SEBI)

Indian trading profitability cannot be evaluated without accounting for statutory taxes. This engine deducts costs **tick-by-tick on every execution**:

| Cost Component | Charge Schedule | Taxing Authority |
|---|---|---|
| **Securities Transaction Tax (STT)** | **0.1%** on Delivery Buy & Sell legs | Ministry of Finance (CBDT) |
| **Stamp Duty** | **0.015%** (Buy leg only, ₹1,500 / Crore) | State Stamp Act |
| **NSE Exchange Turnover Fee** | **0.00297%** on total executed turnover | National Stock Exchange |
| **SEBI Turnover Charge** | **₹10 per Crore** (0.0001%) | SEBI |
| **Goods & Services Tax (GST)** | **18%** on (Brokerage + Exchange Fees + SEBI Fees) | Government of India |
| **Brokerage** | **₹0** (Zero-brokerage delivery model like Zerodha) or flat ₹20 | Broker schedule |
| **Execution Slippage** | User-configurable (default: **2 bps / 0.02%**) | Market microstructure impact |

---

## 9. Statistical Evaluation & Overfitting Protection (DSR)

To protect against data mining bias when running multiple strategy variations:
- **Deflated Sharpe Ratio (DSR)**: Implements Marcos López de Prado's framework, accounting for return skewness, kurtosis, variance of historical trials, and effective track record length.
- **Sharpe Ratio**: Measured against the Indian Risk-Free Rate ($R_f = 6.5\%$, 91-Day Indian Treasury Bill yield).
- **Sortino Ratio**: Excess return divided exclusively by downside semi-deviation.
- **Calmar Ratio**: Annualized return divided by Maximum Drawdown.
- **Maximum Drawdown (Max DD %)**: Worst peak-to-trough decline and recovery duration in trading sessions.

---

## 10. Local Development, Caching & Architecture

### Directory Layout
```
├── download_kite_data.sh       # Standalone one-liner shell script
├── market_data_cache/          # Cached JSON daily candles (10–30 years)
│   ├── NIFTY 50_day.json
│   ├── RELIANCE_day.json
│   └── manifest.json
├── server.ts                   # Express backend proxy with auto-chunking
├── src/
│   ├── cli/
│   │   ├── downloadKiteData.ts # Multi-decade downloader with 365d chunking
│   │   ├── backtestKite.ts     # Multi-decade institutional CLI backtester
│   │   ├── oneGoRunner.ts      # Master all-in-one runner (auth + download + test)
│   │   └── kiteTokenGenerator.ts # Daily OAuth access token generator
│   ├── data/
│   │   └── niftyUniverses.ts   # 500+ NSE stock registry & Kite tokens
│   ├── engine/
│   │   ├── backtestSimulator.ts# Point-in-time multi-stock simulation engine
│   │   ├── costModel.ts        # Tick-by-tick Indian statutory tax model
│   │   └── statsEngine.ts      # Sharpe, Sortino, Calmar, DSR calculations
│   ├── components/             # React dashboard components
│   └── App.tsx                 # Main application controller
```

---

## 11. Troubleshooting & Frequently Asked Questions (FAQ)

#### Q1: Why do I get `HTTP 400 Bad Request` from Kite API?
**Answer**: In Zerodha Kite Connect v3, requesting more than 365 days of daily data in one API call causes an HTTP 400 error. Always use `npm run kite:download` or `npm run kite:one-go`, which automatically splits the date span into safe 365-day chunks and concatenates them.

#### Q2: How often do Kite Access Tokens expire?
**Answer**: Zerodha access tokens expire every morning at **6:00 AM IST**. Before running scripts for the day, simply run:
```bash
npm run kite:auth
```
It takes 15 seconds to log in and automatically refreshes `.env`.

#### Q3: How far back does Zerodha Kite historical data go?
**Answer**:
- For the **NIFTY 50 Index (`token: 256265`)**, historical daily data goes back to inception (~1996–2000).
- For **veteran bluechip equities** (Reliance, Infosys, HDFC Bank, ITC, SBI), data extends back 20 to 25+ years.
- For **recently listed companies** (e.g., ZOMATO listed July 2021, LIC listed May 2022), data is available from their listing date. Our downloader detects pre-listing dates and cleanly begins ingestion from the IPO date onwards.

#### Q4: What if I don't have a Zerodha Kite account?
**Answer**: The entire platform operates in **Offline Fallback Mode** by default. It utilizes a split-adjusted, calibrated historical dataset of Indian equities, allowing you to backtest 10, 20, or 30 years with full functionality even without broker credentials.

#### Q5: How do I export backtest results to Excel or Python?
**Answer**: Append `--export-csv <filename>` to any backtest command:
```bash
npm run kite:backtest -- --years 20 --export-csv trades_20y.csv
```
This exports every single trade ID, ticker, entry date, entry price, exit date, exit price, holding period, gross P&L, net statutory costs, and net percentage return.

