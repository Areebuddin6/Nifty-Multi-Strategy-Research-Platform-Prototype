import React from 'react';
import { GitCommit, ShieldCheck, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export const BlueprintExplorer: React.FC = () => {
  const invariants = [
    {
      id: 'INV-01',
      name: 'Deterministic Next-Open Execution (Zero Lookahead)',
      description: 'Signals calculated on Day T Close (3:20 PM IST) strictly enter or exit on Day T+1 Open (9:15 AM IST). Eliminates artificial execution lookahead bias.',
      status: 'VERIFIED',
    },
    {
      id: 'INV-02',
      name: 'Mandatory Indian Statutory Tax Schedule',
      description: '0.1% STT on equity delivery buy and sell turnover, 18% GST on brokerage and exchange turnover fees, 0.015% state stamp duty on buy leg, and ₹10/Crore SEBI fee deducted on every simulated trade.',
      status: 'VERIFIED',
    },
    {
      id: 'INV-03',
      name: 'Deflated Sharpe Ratio (DSR) Multi-Trial Correction',
      description: 'Sharpe ratio corrected for sample non-normality (skewness/kurtosis) and selection bias across multiple strategy backtests per Marcos López de Prado guidelines.',
      status: 'VERIFIED',
    },
    {
      id: 'INV-04',
      name: 'Point-in-Time Corporate Survivorship & Index Universe',
      description: 'Historical index constituents preserved according to official NSE semi-annual rebalancing dates. Avoids backtesting with today surviving stocks.',
      status: 'VERIFIED',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-sm transition-colors">
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
          <GitCommit className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold uppercase tracking-wider text-emerald-500">System Architecture</span>
          <span>•</span>
          <span>Engine Invariants</span>
        </div>
        <h2 className="text-base font-bold text-white">
          Formal Engine Specification &amp; Quant Invariants
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Mathematical assertions enforced by the simulation kernel to guarantee institutional validity.
        </p>
      </div>

      <div className="space-y-3 mt-4">
        {invariants.map(inv => (
          <div 
            key={inv.id}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {inv.id}
                </span>
                <h3 className="text-sm font-semibold text-white">
                  {inv.name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                {inv.description}
              </p>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{inv.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
