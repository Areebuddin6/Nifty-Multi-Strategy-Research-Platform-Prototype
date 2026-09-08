import React from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  Database, 
  Calendar, 
  Key, 
  Layers, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  Activity,
  ArrowRight
} from 'lucide-react';
import { INSTRUMENTS, PAIR_CANDIDATES, BASKET_CANDIDATES } from '../data/historicalData';

interface DataTransparencyViewProps {
  onOpenHelp?: (section?: any, topicId?: string) => void;
  onNavigateToKite?: () => void;
}

export const DataTransparencyView: React.FC<DataTransparencyViewProps> = ({
  onOpenHelp,
  onNavigateToKite,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Core Data Transparency Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold uppercase tracking-wider text-emerald-500">
                Institutional Data Integrity &amp; Audit Trail
              </span>
              <span>•</span>
              <span>NSE Equities</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Data Sourcing, Verification &amp; Market Realism
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Full transparency on how historical daily candles are sourced, adjusted for splits/dividends, and fed into the simulation kernel.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Point-In-Time Verified</span>
            </span>
          </div>
        </div>

        {/* 3 Pillars of Data Truth */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-white mb-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>1. Historical Horizon &amp; Regimes</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Backtesting spans <strong className="text-white">January 2020 through 2026</strong>, capturing the 2020 COVID crash (-38% Nifty shock), the 2020-2021 liquidity super-rally, the 2022 Fed rate-hike consolidation, and the 2023-2024 all-time high expansion.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-white mb-2">
              <IndianRupee className="w-4 h-4 text-amber-400" />
              <span>2. Real Statutory Indian Tax Frictions</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every simulated trade deducts statutory <strong className="text-white">0.1% delivery STT</strong> on buy &amp; sell turnover, state stamp duty (0.015%), NSE exchange turnover fees (0.00297%), SEBI charges (₹10/Cr), and 18% GST on brokerage.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-white mb-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>3. Dual-Mode Feed Architecture</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Seamlessly switches between our offline <strong className="text-white">Point-in-Time Curated Benchmark Data</strong> and live <strong className="text-white">Zerodha Kite Connect v3 Historical API</strong> without leaking API credentials to the browser.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Stock Universe & Instruments Available */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              Curated High-Liquidity Equity Universe
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Top Nifty 50 constituents chosen for zero impact cost, deep order books, and clean cointegration residuals.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {INSTRUMENTS.length} Major Constituents
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
          {INSTRUMENTS.map(inst => (
            <div 
              key={inst.symbol}
              className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white block">{inst.symbol}</span>
                <span className="text-[10px] text-slate-400 truncate block">{inst.name}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500">{inst.sector}</span>
                <span className="text-emerald-400 font-bold">{(inst as any).weight ? `${(inst as any).weight.toFixed(1)}%` : (inst as any).marketCapTier || 'NSE'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Live Kite Connect Bridge Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Zerodha Kite Connect v3 Broker Data Bridge
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              You can connect your own Zerodha API credentials via environment variables to stream tick-level continuous candles directly from the exchange.
            </p>
          </div>

          {onNavigateToKite && (
            <button
              onClick={onNavigateToKite}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              <span>Configure Kite API Keys</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
