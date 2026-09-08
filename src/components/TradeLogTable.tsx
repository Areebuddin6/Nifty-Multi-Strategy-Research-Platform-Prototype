import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Filter, 
  Search, 
  Receipt,
  FileText,
  Clock,
  ShieldCheck 
} from 'lucide-react';
import { Trade, CostBreakdown } from '../types';
import { CostAnalysisModal } from './CostAnalysisModal';

interface TradeLogTableProps {
  trades: Trade[];
  totalCosts: CostBreakdown;
  isSimpleMode?: boolean;
}

export const TradeLogTable: React.FC<TradeLogTableProps> = ({
  trades,
  totalCosts,
  isSimpleMode = false,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'win' | 'loss'>('all');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter trades
  const filteredTrades = trades.filter(trade => {
    if (filterType === 'win' && (trade.netPnl ?? 0) <= 0) return false;
    if (filterType === 'loss' && (trade.netPnl ?? 0) > 0) return false;
    const sym = trade.symbol || trade.ticker || '';
    if (searchSymbol && !sym.toLowerCase().includes(searchSymbol.toLowerCase())) return false;
    return true;
  });

  const formatINR = (val: number) => {
    const num = val ?? 0;
    const isNeg = num < 0;
    const abs = Math.abs(num);
    return `${isNeg ? '-' : ''}₹${abs.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
  };

  const handleOpenTradeCost = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    if (trades.length === 0) return;
    const headers = 'ID,Symbol,Side,EntryDate,EntryPrice,ExitDate,ExitPrice,Shares,GrossPnL,STT,StampDuty,ExchangeFees,GST,SEBI,Brokerage,TotalCost,NetPnL,NetReturnPct,HoldingDays,ExitReason\n';
    const rows = trades.map(t => {
      const sym = t.symbol || t.ticker || 'NIFTY';
      const shares = t.shares ?? t.quantity ?? 1;
      const netReturn = t.netReturnPct ?? t.netPnlPercent ?? 0;
      const costTotal = t.cost?.total ?? t.cost?.totalCost ?? 0;
      return [
        t.id,
        `"${sym}"`,
        t.side,
        t.entryDate,
        (t.entryPrice ?? 0).toFixed(2),
        t.exitDate,
        (t.exitPrice ?? 0).toFixed(2),
        shares,
        (t.grossPnl ?? 0).toFixed(2),
        (t.cost?.stt ?? 0).toFixed(2),
        (t.cost?.stampDuty ?? 0).toFixed(2),
        (t.cost?.exchangeFees ?? 0).toFixed(2),
        (t.cost?.gst ?? 0).toFixed(2),
        (t.cost?.sebiCharges ?? 0).toFixed(2),
        (t.cost?.brokerage ?? 0).toFixed(2),
        costTotal.toFixed(2),
        (t.netPnl ?? 0).toFixed(2),
        netReturn.toFixed(2),
        t.holdingDays ?? 0,
        `"${t.exitReason || ''}"`
      ].join(',');
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Nifty_Backtest_Trades_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-sm transition-colors">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
            <span>Historical Executed Trade Log</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {trades.length} Closed Fills
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Every trade includes point-in-time statutory STT (0.1%), stamp duty, SEBI turnover, and GST deductions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick Filter Buttons */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded cursor-pointer ${filterType === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('win')}
              className={`px-2.5 py-1 rounded cursor-pointer ${filterType === 'win' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              Winners
            </button>
            <button
              onClick={() => setFilterType('loss')}
              className={`px-2.5 py-1 rounded cursor-pointer ${filterType === 'loss' ? 'bg-rose-500/20 text-rose-400 font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              Losers
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table of Trades */}
      <div className="overflow-x-auto max-h-96 mt-3">
        <table className="w-full text-xs text-left font-mono">
          <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Symbol</th>
              <th className="py-2.5 px-3">Side</th>
              <th className="py-2.5 px-3">Entry Date &amp; Price</th>
              <th className="py-2.5 px-3">Exit Date &amp; Price</th>
              <th className="py-2.5 px-3 text-right">Shares</th>
              <th className="py-2.5 px-3 text-right">Gross P&amp;L</th>
              <th className="py-2.5 px-3 text-right">STT &amp; Taxes</th>
              <th className="py-2.5 px-3 text-right">Net P&amp;L (₹)</th>
              <th className="py-2.5 px-3 text-right">Return %</th>
              <th className="py-2.5 px-3 text-center">Duration</th>
              <th className="py-2.5 px-3">Exit Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredTrades.map(t => {
              const isProfit = (t.netPnl ?? 0) >= 0;
              const sym = t.symbol || t.ticker || 'NIFTY';
              const shares = t.shares ?? t.quantity ?? 1;
              const netReturn = t.netReturnPct ?? t.netPnlPercent ?? 0;
              const costTotal = t.cost?.total ?? t.cost?.totalCost ?? 0;

              return (
                <tr key={t.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-2 px-3 text-slate-500">{t.id}</td>
                  <td className="py-2 px-3 font-sans font-bold text-white">{sym}</td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      t.side === 'LONG' || t.side === 'BUY' || t.side === 'LONG_SPREAD'
                        ? 'bg-emerald-500/15 text-emerald-400' 
                        : 'bg-rose-500/15 text-rose-400'
                    }`}>
                      {t.side}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-300">
                    <div>{t.entryDate}</div>
                    <div className="text-slate-500 text-[10px]">₹{(t.entryPrice ?? 0).toFixed(2)}</div>
                  </td>
                  <td className="py-2 px-3 text-slate-300">
                    <div>{t.exitDate}</div>
                    <div className="text-slate-500 text-[10px]">₹{(t.exitPrice ?? 0).toFixed(2)}</div>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400">{shares}</td>
                  <td className={`py-2 px-3 text-right ${(t.grossPnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatINR(t.grossPnl ?? 0)}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleOpenTradeCost(t)}
                      className="text-amber-400 hover:text-amber-300 underline decoration-dotted text-right block w-full cursor-pointer"
                      title="Click to view itemized statutory tax schedule"
                    >
                      {formatINR(costTotal)}
                    </button>
                  </td>
                  <td className={`py-2 px-3 text-right font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatINR(t.netPnl ?? 0)}
                  </td>
                  <td className={`py-2 px-3 text-right font-semibold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfit ? '+' : ''}{netReturn.toFixed(2)}%
                  </td>
                  <td className="py-2 px-3 text-center text-slate-400">{t.holdingDays ?? 0}d</td>
                  <td className="py-2 px-3 text-[11px] text-slate-400 font-sans">{t.exitReason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Itemized Modal */}
      <CostAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        costs={totalCosts}
        selectedTrade={selectedTrade}
      />
    </div>
  );
};
