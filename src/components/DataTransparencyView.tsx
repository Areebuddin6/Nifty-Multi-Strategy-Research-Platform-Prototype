import React from 'react';
import { 
  ShieldCheck, 
  Database, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  FileText, 
  ExternalLink,
  IndianRupee,
  Layers
} from 'lucide-react';
import { INSTRUMENT_TOKENS } from '../data/historicalData';

export const DataTransparencyView: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-sm transition-colors">
      {/* Header */}
      <div className="pb-5 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold uppercase tracking-wider text-emerald-500">Methodology &amp; Verification</span>
          <span>•</span>
          <span>Zero Black-Box Transparency</span>
        </div>
        <h2 className="text-xl font-bold text-white">
          Data Integrity, Bias Elimination &amp; Transparency
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Most backtesters online show inflated, unreal profits because they ignore Indian delivery taxes, use future lookahead data, or test survivorship-biased universes. Here is exactly how this engine guarantees mathematical honesty.
        </p>
      </div>

      {/* 4 Core Pillars of Integrity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center space-x-2 mb-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">1. Point-in-Time Execution (No Lookahead)</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Signals are evaluated exclusively at the market close (3:30 PM). Entries are executed strictly at the <strong className="text-slate-200">Next Trading Day's Opening Price</strong>. This eliminates the #1 cause of fake backtest profits: assuming you can buy at the same close you used to calculate the signal.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center space-x-2 mb-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">2. Survivorship-Free Historical Universes</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            We do not test current Nifty 50 constituents backwards in time (which excludes failed companies). Our universe models historical constituent changes (such as the exclusion of Yes Bank or Indiabulls) to reflect true real-time trading realities.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center space-x-2 mb-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">3. Exact Statutory Tax Breakdown (STT, SEBI, GST)</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every trade automatically deducts 0.1% Securities Transaction Tax (STT) on buy and sell delivery turnover, NSE Exchange turnover fees (0.00297%), 18% GST, SEBI charges (₹10/Crore), state stamp duty (0.015%), and user-configured brokerages.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center space-x-2 mb-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">4. Overfitting Detection (PSR &amp; DSR)</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standard Sharpe ratios are prone to lucky runs. We calculate Marcos López de Prado's <strong className="text-slate-200">Deflated Sharpe Ratio (DSR)</strong> and <strong className="text-slate-200">Probabilistic Sharpe Ratio (PSR)</strong>, mathematically correcting for non-normal skewness, kurtosis, and selection bias.
          </p>
        </div>
      </div>

      {/* Official NSE Instrument Tokens Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden mb-6">
        <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Zerodha Kite Connect Verified NSE Instrument Tokens
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Direct API compatible (X-Kite-Version: 3)
          </span>
        </div>

        <div className="overflow-x-auto max-h-60">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Instrument / Stock</th>
                <th className="py-2.5 px-4">Trading Symbol</th>
                <th className="py-2.5 px-4">Exchange</th>
                <th className="py-2.5 px-4">Official Token #</th>
                <th className="py-2.5 px-4">Tick Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {Object.entries(INSTRUMENT_TOKENS).slice(0, 10).map(([sym, token]) => (
                <tr key={sym} className="hover:bg-slate-850/50 transition">
                  <td className="py-2 px-4 font-semibold text-white">{sym}</td>
                  <td className="py-2 px-4 text-emerald-400">{sym.replace(' ', '')}</td>
                  <td className="py-2 px-4">NSE</td>
                  <td className="py-2 px-4 text-slate-400">#{token}</td>
                  <td className="py-2 px-4">0.05</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Frequently Asked Questions for Traders</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">
              Q: What is the difference between Simple Mode and Quant Mode?
            </span>
            <p className="text-slate-400 leading-relaxed">
              Simple mode hides complex Greek math (kurtosis, ADF t-statistics, variance drag) and shows you the numbers that matter in everyday life: Net Rupees Made, Annual Return %, Win Rate, and Total Taxes. Quant mode displays the complete institutional econometric matrix.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">
              Q: Why does my backtest show a lower return than popular YouTube backtesters?
            </span>
            <p className="text-slate-400 leading-relaxed">
              Most amateur backtesters simulate 0% brokerage, 0% STT, and immediate same-bar fills. On an active strategy with 60 trades a year, STT and friction alone can consume 6% to 12% of your gross profits. Our engine deducts all government taxes upfront so your expectations match real broker statements.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">
              Q: Can I connect my real Zerodha account?
            </span>
            <p className="text-slate-400 leading-relaxed">
              Yes! Click the <strong className="text-emerald-400">Zerodha Kite Data</strong> tab above. You can configure your Kite Connect API key and secret in your `.env` file to pull live historical candles directly from Zerodha servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
