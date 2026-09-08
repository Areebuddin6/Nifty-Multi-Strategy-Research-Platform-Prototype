import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  IndianRupee, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  FileSpreadsheet
} from 'lucide-react';
import { Trade } from '../types';

interface TradeLogTableProps {
  trades: Trade[];
  onOpenCostBreakdown?: (trade: Trade) => void;
}

export const TradeLogTable: React.FC<TradeLogTableProps> = ({ trades, onOpenCostBreakdown }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSide, setFilterSide] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredTrades = trades.filter((t) => {
    const matchesSearch =
      t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.entryDate.includes(searchTerm) ||
      t.exitDate.includes(searchTerm) ||
      t.exitReason.toLowerCase().includes(searchTerm.toLowerCase());

    const isWin = t.netPnl > 0;
    const matchesSide =
      filterSide === 'ALL' || (filterSide === 'WIN' && isWin) || (filterSide === 'LOSS' && !isWin);

    return matchesSearch && matchesSide;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / itemsPerPage));
  const displayedTrades = filteredTrades.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatINR = (val: number) => {
    const isNeg = val < 0;
    const abs = Math.abs(val);
    return `${isNeg ? '-₹' : '₹'}${abs.toLocaleString('en-IN', { maximumFractionDigits: 1 })}`;
  };

  const handleExportCSV = () => {
    if (trades.length === 0) return;
    const headers = [
      'Trade ID',
      'Symbol',
      'Side',
      'Entry Date',
      'Entry Price',
      'Exit Date',
      'Exit Price',
      'Holding Days',
      'Gross PnL (INR)',
      'Total Statutory Costs (INR)',
      'Net Realized PnL (INR)',
      'Return (%)',
      'Exit Reason',
    ];

    const rows = trades.map((t) => [
      t.id,
      t.symbol,
      t.side,
      t.entryDate,
      t.entryPrice.toFixed(2),
      t.exitDate,
      t.exitPrice.toFixed(2),
      t.holdingDays,
      t.grossPnl.toFixed(2),
      t.cost.total.toFixed(2),
      t.netPnl.toFixed(2),
      t.netPnlPercent.toFixed(2) + '%',
      t.exitReason,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nifty_backtest_trades_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 transition-colors shadow-sm">
      {/* Table Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
            <span>Audit Trail &amp; Executed Trades Log</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {trades.length} Realized
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Every trade is modeled with point-in-time opening fills, holding days, and exact Indian taxes
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search ticker, date, reason..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Filter Side */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => {
                setFilterSide('ALL');
                setCurrentPage(1);
              }}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                filterSide === 'ALL' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setFilterSide('WIN');
                setCurrentPage(1);
              }}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                filterSide === 'WIN' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400'
              }`}
            >
              Wins
            </button>
            <button
              onClick={() => {
                setFilterSide('LOSS');
                setCurrentPage(1);
              }}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                filterSide === 'LOSS' ? 'bg-rose-500/20 text-rose-400 font-semibold' : 'text-slate-400'
              }`}
            >
              Losses
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 text-xs font-mono transition-colors cursor-pointer"
            title="Download detailed CSV trade journal"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Trades Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Instrument</th>
              <th className="py-2.5 px-3 font-semibold">Side</th>
              <th className="py-2.5 px-3 font-semibold">Entry (Date &amp; ₹)</th>
              <th className="py-2.5 px-3 font-semibold">Exit (Date &amp; ₹)</th>
              <th className="py-2.5 px-3 font-semibold text-center">Holding</th>
              <th className="py-2.5 px-3 font-semibold text-right">Gross P&amp;L</th>
              <th className="py-2.5 px-3 font-semibold text-right">Friction (₹)</th>
              <th className="py-2.5 px-3 font-semibold text-right">Net Realized (₹)</th>
              <th className="py-2.5 px-3 font-semibold text-right">Net %</th>
              <th className="py-2.5 px-3 font-semibold">Exit Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {displayedTrades.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500">
                  No executed trades match your criteria.
                </td>
              </tr>
            ) : (
              displayedTrades.map((t) => {
                const isWin = t.netPnl > 0;
                return (
                  <tr key={t.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-100">{t.symbol}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          t.side === 'LONG' || t.side === 'BUY'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-indigo-500/20 text-indigo-400'
                        }`}
                      >
                        {t.side}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-400 block text-[11px]">{t.entryDate}</span>
                      <span className="text-slate-200">₹{t.entryPrice.toFixed(2)}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-400 block text-[11px]">{t.exitDate}</span>
                      <span className="text-slate-200">₹{t.exitPrice.toFixed(2)}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-400">
                      {t.holdingDays}d
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-medium ${
                        t.grossPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatINR(t.grossPnl)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onOpenCostBreakdown && onOpenCostBreakdown(t)}
                        className="text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
                        title="Click to view full STT, GST, stamp duty breakdown"
                      >
                        -₹{t.cost.total.toFixed(1)}
                      </button>
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        isWin ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {formatINR(t.netPnl)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        isWin ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {isWin ? '+' : ''}
                      {t.netPnlPercent.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded border ${
                          t.exitReason.includes('TARGET') || t.exitReason.includes('REVERT')
                            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                            : t.exitReason.includes('STOP')
                            ? 'bg-rose-950/40 border-rose-800 text-rose-400'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {t.exitReason}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredTrades.length)} of {filteredTrades.length} trades
          </div>
          <div className="flex space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-slate-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
