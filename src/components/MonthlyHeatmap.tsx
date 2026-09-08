import React from 'react';
import { MonthlyReturn } from '../types';

interface MonthlyHeatmapProps {
  data: MonthlyReturn[];
}

export const MonthlyHeatmap: React.FC<MonthlyHeatmapProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Group by year cleanly
  const yearSet = new Set<number>();
  data.forEach(d => yearSet.add(Number(d.year)));
  const years: number[] = Array.from(yearSet).sort((a, b) => a - b);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Lookup map: `${year}-${monthIndex (0-11)}` => returnPct
  const matrix: { [key: string]: number } = {};
  const annualMap: { [year: number]: number } = {};

  data.forEach(d => {
    if (d.months) {
      Object.keys(d.months).forEach(mStr => {
        const m = Number(mStr);
        matrix[`${d.year}-${m}`] = d.months![m];
      });
      if (d.annualTotal !== undefined) {
        annualMap[d.year] = d.annualTotal;
      }
    } else if (d.month !== undefined && d.returnPct !== undefined) {
      matrix[`${d.year}-${d.month}`] = d.returnPct;
    }
  });

  const getColor = (val: number | undefined) => {
    if (val === undefined) return 'bg-slate-900/60 text-slate-600 border-slate-800/40';
    if (val > 6) return 'bg-emerald-500/30 text-emerald-300 border-emerald-500/40 font-bold';
    if (val > 2) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (val > 0) return 'bg-emerald-500/10 text-emerald-400/90 border-emerald-500/20';
    if (val === 0) return 'bg-slate-900 text-slate-400 border-slate-800';
    if (val > -2) return 'bg-rose-500/10 text-rose-400/90 border-rose-500/20';
    if (val > -6) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    return 'bg-rose-500/30 text-rose-300 border-rose-500/40 font-bold';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-sm overflow-x-auto transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Monthly Performance Heatmap (Net of Taxes)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical distribution of calendar monthly returns across multiple market cycles.
          </p>
        </div>
      </div>

      <table className="w-full text-xs text-center border-collapse font-mono">
        <thead>
          <tr className="text-slate-500 border-b border-slate-800">
            <th className="py-2 px-2 text-left font-sans text-xs">Year</th>
            {months.map(m => (
              <th key={m} className="py-2 px-1 font-medium">{m}</th>
            ))}
            <th className="py-2 px-2 text-right font-sans text-xs text-slate-400">YTD</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {years.map(year => {
            let yearCompounded = 1;
            let hasTrades = false;

            for (let m = 0; m < 12; m++) {
              const val = matrix[`${year}-${m}`];
              if (val !== undefined) {
                yearCompounded *= 1 + val / 100;
                hasTrades = true;
              }
            }

            const ytdReturn = annualMap[year] !== undefined
              ? annualMap[year]
              : hasTrades
              ? (yearCompounded - 1) * 100
              : undefined;

            return (
              <tr key={year} className="hover:bg-slate-800/40 transition">
                <td className="py-2 px-2 text-left font-sans font-semibold text-slate-300">
                  {year}
                </td>
                {months.map((_, mIdx) => {
                  const val = matrix[`${year}-${mIdx}`];
                  return (
                    <td key={mIdx} className="p-1">
                      <div
                        className={`py-1.5 px-0.5 rounded border text-[11px] transition ${getColor(val)}`}
                      >
                        {val !== undefined ? `${val > 0 ? '+' : ''}${val.toFixed(1)}%` : '—'}
                      </div>
                    </td>
                  );
                })}
                <td className="py-2 px-2 text-right font-bold">
                  {ytdReturn !== undefined ? (
                    <span
                      className={`px-2 py-1 rounded text-[11px] ${
                        ytdReturn >= 0
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {ytdReturn > 0 ? '+' : ''}{ytdReturn.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
