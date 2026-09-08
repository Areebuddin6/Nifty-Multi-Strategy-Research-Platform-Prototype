import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  BookOpen, 
  TrendingUp, 
  Activity, 
  IndianRupee, 
  ShieldAlert, 
  Layers, 
  Key, 
  Search,
  CheckCircle2
} from 'lucide-react';

export type HelpSectionId = 
  | 'overview' 
  | 'strategies' 
  | 'metrics' 
  | 'taxes' 
  | 'kite' 
  | 'faq';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: HelpSectionId;
  initialTopicId?: string;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({
  isOpen,
  onClose,
  initialSection = 'overview',
}) => {
  const [activeSection, setActiveSection] = useState<HelpSectionId>(initialSection);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-colors">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Platform Guide &amp; Methodology Manual</h2>
              <p className="text-xs text-slate-400">Complete documentation for trading models, metrics, Indian tax laws &amp; Kite API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 border-r border-slate-800 bg-slate-950/30 p-3 space-y-1 overflow-y-auto">
            <button
              onClick={() => setActiveSection('overview')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
                activeSection === 'overview'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Platform Overview</span>
            </button>

            <button
              onClick={() => setActiveSection('strategies')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
                activeSection === 'strategies'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>8 Strategy Rules</span>
            </button>

            <button
              onClick={() => setActiveSection('metrics')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
                activeSection === 'metrics'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Quant Metrics (CAGR, DSR)</span>
            </button>

            <button
              onClick={() => setActiveSection('taxes')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
                activeSection === 'taxes'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <IndianRupee className="w-4 h-4" />
              <span>Indian Taxes (STT &amp; SEBI)</span>
            </button>

            <button
              onClick={() => setActiveSection('kite')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
                activeSection === 'kite'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Zerodha Kite Connect</span>
            </button>
          </div>

          {/* Details Pane */}
          <div className="flex-1 p-6 overflow-y-auto text-xs text-slate-300 leading-relaxed space-y-4">
            {activeSection === 'overview' && (
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Welcome to Nifty Multi-Strategy Research Platform</h3>
                <p className="text-slate-400 mb-3">
                  This platform is a quantitative backtesting and statistical arbitrage system designed specifically for the Indian equity markets (NSE).
                </p>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-emerald-400 block">Core Principles:</span>
                  <p>• <strong>Strict Next-Open Execution:</strong> Avoids false signals and lookahead bias.</p>
                  <p>• <strong>Realistic Indian Taxes:</strong> Full statutory STT (0.1%), GST (18%), exchange turnover fees, and stamp duty deducted on every fill.</p>
                  <p>• <strong>Simple &amp; Quant Modes:</strong> Effortlessly switch between layman-friendly retail summaries and institutional econometric matrices.</p>
                </div>
              </div>
            )}

            {activeSection === 'strategies' && (
              <div>
                <h3 className="text-sm font-bold text-white mb-2">The 8 Systematic Trading Strategies</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-bold text-emerald-400 block">1. Supertrend + 200 EMA Swing</span>
                    <p className="text-slate-400 mt-1">Buys when price crosses above the Supertrend baseline while staying above the 200 EMA. Rides medium-term macro swings with automated exit discipline.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-bold text-emerald-400 block">2. RSI Oversold Pullback (Buy The Dip)</span>
                    <p className="text-slate-400 mt-1">Buys temporary panics in high-quality bluechips where 5-day RSI drops below 28 while long-term trend remains bullish.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-bold text-emerald-400 block">3. 50 EMA x 200 EMA Golden Cross</span>
                    <p className="text-slate-400 mt-1">The classic long-term institutional trend system. Low turnover reduces transaction friction.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-bold text-emerald-400 block">4. Twin Stock Arbitrage (ADF Stat-Arb)</span>
                    <p className="text-slate-400 mt-1">Market-neutral statistical arbitrage between economically linked stock pairs (e.g. HDFC Bank vs ICICI Bank). Profits regardless of whether the overall market rallies or crashes.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'metrics' && (
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Understanding Quant Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-bold text-white block">CAGR (Compound Annual Growth Rate)</span>
                    <p className="text-slate-400 mt-0.5">The geometric progression ratio that provides a constant rate of return over the historical backtesting period.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-bold text-white block">Sharpe Ratio &amp; Sortino Ratio</span>
                    <p className="text-slate-400 mt-0.5">Sharpe measures excess return per unit of total risk (assuming 6.5% Indian risk-free rate). Sortino penalizes only harmful downside volatility.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-bold text-white block">Deflated Sharpe Ratio (DSR) &amp; PSR</span>
                    <p className="text-slate-400 mt-0.5">Developed by Marcos López de Prado. Adjusts Sharpe for non-normality (skewness, fat tails) and the number of repeated strategy trials to prevent data mining bias.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'taxes' && (
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Indian Statutory Taxes &amp; Fees</h3>
                <p className="text-slate-400 mb-3">
                  All simulations automatically calculate statutory taxes based on official Government of India / SEBI rules:
                </p>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono">
                  <div className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span>STT (Securities Transaction Tax)</span>
                    <span className="text-amber-400">0.1% on buy &amp; sell</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span>NSE Exchange Turnover Charge</span>
                    <span className="text-white">0.00297%</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span>State Stamp Duty</span>
                    <span className="text-white">0.015% (Buy only)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span>GST</span>
                    <span className="text-white">18% on (Brokerage + Exch)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SEBI Turnover Charge</span>
                    <span className="text-white">₹10 per Crore</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'kite' && (
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Zerodha Kite Connect v3 Broker Integration</h3>
                <p className="text-slate-400 mb-3">
                  To pull live historical candles directly from Zerodha Kite Connect, add your credentials in the environment variables:
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1">
                  <p>KITE_API_KEY=your_kite_api_key</p>
                  <p>KITE_API_SECRET=your_kite_api_secret</p>
                  <p>KITE_ACCESS_TOKEN=your_generated_access_token</p>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  The system automatically handles proxying with the required <code className="text-slate-200">X-Kite-Version: 3</code> header and provides offline caching.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
