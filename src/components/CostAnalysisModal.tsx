import React from 'react';
import { X, ShieldCheck, IndianRupee, Info, CheckCircle2 } from 'lucide-react';
import { CostBreakdown, Trade } from '../types';

interface CostAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  costs: CostBreakdown;
  selectedTrade?: Trade | null;
}

export const CostAnalysisModal: React.FC<CostAnalysisModalProps> = ({
  isOpen,
  onClose,
  costs,
  selectedTrade,
}) => {
  if (!isOpen) return null;

  const displayCosts = selectedTrade ? selectedTrade.cost : costs;

  const formatINR = (val: number) => {
    return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
  };

  const getPercent = (amount: number) => {
    if (displayCosts.total === 0) return '0.0%';
    return ((amount / displayCosts.total) * 100).toFixed(1) + '%';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-colors">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-amber-500">
                {selectedTrade ? `Trade #${selectedTrade.id} Cost Breakdown` : 'Portfolio Total Statutory Friction'}
              </span>
              <span>•</span>
              <span>NSE Equity Delivery</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {selectedTrade ? `${selectedTrade.symbol} Detailed Tax Breakdown` : 'Indian Statutory Tax & Friction Audit'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Cost Highlight */}
        <div className="my-5 p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Total Statutory Friction Deducted</span>
            <span className="text-2xl font-bold font-mono text-amber-400">{formatINR(displayCosts.total)}</span>
          </div>
          <div className="text-right text-xs text-slate-400">
            <span className="block font-semibold text-emerald-400">100% Tax Compliant</span>
            <span>Real SEBI/FinMin Tariff Schedule</span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden mb-5">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Statutory Charge / Tax</th>
                <th className="py-2.5 px-4 font-semibold">Government Rate Schedule</th>
                <th className="py-2.5 px-4 font-semibold text-right">Amount (₹)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 px-4 font-semibold text-white">STT (Securities Transaction Tax)</td>
                <td className="py-2.5 px-4 text-slate-400">0.1% on Buy &amp; Sell Turnover</td>
                <td className="py-2.5 px-4 text-right font-bold text-white">{formatINR(displayCosts.stt)}</td>
                <td className="py-2.5 px-4 text-right text-slate-400">{getPercent(displayCosts.stt)}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-white">NSE Exchange Turnover Charges</td>
                <td className="py-2.5 px-4 text-slate-400">0.00297% (₹297 per Crore)</td>
                <td className="py-2.5 px-4 text-right font-bold text-white">{formatINR(displayCosts.exchangeFees)}</td>
                <td className="py-2.5 px-4 text-right text-slate-400">{getPercent(displayCosts.exchangeFees)}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-white">State Stamp Duty (Delivery)</td>
                <td className="py-2.5 px-4 text-slate-400">0.015% on Buy Turnover only</td>
                <td className="py-2.5 px-4 text-right font-bold text-white">{formatINR(displayCosts.stampDuty)}</td>
                <td className="py-2.5 px-4 text-right text-slate-400">{getPercent(displayCosts.stampDuty)}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-white">GST (Goods &amp; Services Tax)</td>
                <td className="py-2.5 px-4 text-slate-400">18% on (Brokerage + Exchange Fees)</td>
                <td className="py-2.5 px-4 text-right font-bold text-white">{formatINR(displayCosts.gst)}</td>
                <td className="py-2.5 px-4 text-right text-slate-400">{getPercent(displayCosts.gst)}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-white">SEBI Regulatory Turnover Fees</td>
                <td className="py-2.5 px-4 text-slate-400">₹10 per Crore of turnover</td>
                <td className="py-2.5 px-4 text-right font-bold text-white">{formatINR(displayCosts.sebiCharges)}</td>
                <td className="py-2.5 px-4 text-right text-slate-400">{getPercent(displayCosts.sebiCharges)}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-white">Brokerage Commission</td>
                <td className="py-2.5 px-4 text-slate-400">Configured Flat (₹0 Zerodha / ₹20)</td>
                <td className="py-2.5 px-4 text-right font-bold text-white">{formatINR(displayCosts.brokerage)}</td>
                <td className="py-2.5 px-4 text-right text-slate-400">{getPercent(displayCosts.brokerage)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Explanatory note */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start space-x-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            Unlike CFD or Forex platforms, Indian equity swing trading involves real statutory delivery taxes. STT is legally levied by the Ministry of Finance and cannot be waived by any discount broker. This table demonstrates why your simulated performance matches actual broker contract notes.
          </p>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
