import React from 'react';
import { MonthlyReturn, ThemeMode } from '../types';

interface MonthlyHeatmapProps {
  monthlyReturns: MonthlyReturn[];
  theme?: ThemeMode;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const MonthlyHeatmap: React.FC<MonthlyHeatmapProps> = ({ monthlyReturns, theme = 'dark' }) => {
  if (!monthlyReturns || monthlyReturns.length === 0) {
    return null;
  }

  const isLight = theme === 'light';

  const getCellBg = (val?: number) => {
    if (val === undefined || isNaN(val)) {
      return isLight ? 'bg-slate-100 text-slate-400' : 'bg-slate-950 text-slate-600';
    }
    if (isLight) {
      if (val > 6) return 'bg-emerald-200 text-emerald-950 font-bold';
      if (val > 3) return 'bg-emerald-100 text-emerald-900 font-semibold';
      if (val > 0.5) return 'bg-emerald-50 text-emerald-800';
      if (val > 0) return 'bg-emerald-50/70 text-emerald-700';
      if (val === 0) return 'bg-slate-100 text-slate-500';
      if (val > -1) return 'bg-rose-50/70 text-rose-700';
      if (val > -3) return 'bg-rose-50 text-rose-800';
      if (val > -6) return 'bg-rose-100 text-rose-900 font-semibold';
      return 'bg-rose-200 text-rose-950 font-bold';
    } else {
      if (val > 6) return 'bg-emerald-600/50 text-emerald-200 font-semibold';
      if (val > 3) return 'bg-emerald-600/35 text-emerald-300';
      if (val > 0.5) return 'bg-emerald-600/20 text-emerald-400';
      if (val > 0) return 'bg-emerald-600/10 text-emerald-400';
      if (val === 0) return 'bg-slate-900 text-slate-400';
      if (val > -1) return 'bg-rose-600/15 text-rose-400';
      if (val > -3) return 'bg-rose-600/30 text-rose-300';
      if (val > -6) return 'bg-rose-600/45 text-rose-200';
      return 'bg-rose-700/60 text-rose-100 font-semibold';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 transition-colors shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Monthly Returns Matrix (Net of Costs)</h3>
          <p className="text-xs text-slate-400">
            Historical month-over-month performance breakdown across market regimes (2018–2026)
          </p>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/40"></span>
            <span className="text-slate-400">Positive</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500/40"></span>
            <span className="text-slate-400">Negative</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-center">
              <th className="py-2 px-3 text-left font-semibold text-slate-300">Year</th>
              {MONTH_NAMES.map((m) => (
                <th key={m} className="py-2 px-2 font-medium">{m}</th>
              ))}
              <th className="py-2 px-3 text-right font-semibold text-slate-200">Year Total</th>
            </tr>
          </thead>
          <tbody>
            {monthlyReturns.map((row) => (
              <tr key={row.year} className="border-b border-slate-800/60 hover:bg-slate-850/40 transition-colors">
                <td className="py-2 px-3 font-semibold text-slate-300 text-left bg-slate-950/40">
                  {row.year}
                </td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                  const val = row.months[m];
                  return (
                    <td
                      key={m}
                      className={`py-2 px-1 text-center rounded-sm transition-colors ${getCellBg(val)}`}
                    >
                      {val !== undefined ? `${val > 0 ? '+' : ''}${val.toFixed(1)}%` : '—'}
                    </td>
                  );
                })}
                <td
                  className={`py-2 px-3 text-right font-bold bg-slate-950/40 ${
                    row.annualTotal >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {row.annualTotal >= 0 ? '+' : ''}
                  {row.annualTotal.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
