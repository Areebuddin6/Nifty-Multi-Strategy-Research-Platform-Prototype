import React from 'react';
import { GitCommit, ShieldCheck, CheckCircle2, FileText, Database, Code } from 'lucide-react';

export const BlueprintExplorer: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-sm transition-colors">
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
          <GitCommit className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold uppercase tracking-wider text-emerald-500">Architecture &amp; Specifications</span>
          <span>•</span>
          <span>Formal System Invariants</span>
        </div>
        <h2 className="text-xl font-bold text-white">
          System Blueprint &amp; Execution Invariants
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Mathematical and architectural contracts that enforce point-in-time veracity and statutory fidelity across every simulation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Invariant 1: Point-in-Time Signal &amp; Entry Sequencing</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Signals generated on bar <code className="text-emerald-400 font-mono">T</code> use data available up to market close on date <code className="text-emerald-400 font-mono">T</code>. Execution occurs at the open of bar <code className="text-emerald-400 font-mono">T+1</code>. No lookahead leakage is mathematically possible in this state machine.
          </p>
          <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-slate-300 border border-slate-800">
            signalDate = Date[T]; fillDate = Date[T+1]; fillPrice = Open[T+1]
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Invariant 2: Statutory Tax Deductions on Equity Turnover</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Every transaction deducts exact FinMin/SEBI charges: 0.1% STT on both buy and sell legs, NSE turnover fees of 0.00297%, 18% GST on brokerage + exchange fees, state stamp duty of 0.015% on buy turnover, and SEBI charges of ₹10 per crore.
          </p>
          <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-slate-300 border border-slate-800">
            STT = 0.001 * (BuyTurnover + SellTurnover)
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Invariant 3: Realized P&amp;L Exit-Date Bucketing</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Realized profits or losses are credited to portfolio cash strictly on the settlement exit date <code className="text-emerald-400 font-mono">T_exit</code>, preventing artificial mid-trade mark-to-market compounding before position closing.
          </p>
          <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-slate-300 border border-slate-800">
            portfolioCash += (sellTurnover - buyTurnover - totalFriction)
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Invariant 4: Deflated Sharpe Overfitting Penalization</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            The engine automatically computes skewness, kurtosis, and the effective number of independent strategy trials to calculate the Deflated Sharpe Ratio (DSR), safeguarding quants against selection bias and false alpha.
          </p>
          <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-slate-300 border border-slate-800">
            DSR = PSR(Sharpe, Var(Sharpe), Skewness, Kurtosis, N_trials)
          </div>
        </div>
      </div>
    </div>
  );
};
