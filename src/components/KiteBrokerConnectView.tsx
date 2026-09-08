import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink, Terminal, Database } from 'lucide-react';
import { NSE_INSTRUMENT_MAP } from '../auth';

export const KiteBrokerConnectView: React.FC = () => {
  const [status, setStatus] = useState<{
    configured: boolean;
    hasAccessToken: boolean;
    apiKeySet: boolean;
    apiSecretSet: boolean;
    loginUrl?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testSymbol, setTestSymbol] = useState('RELIANCE');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/kite/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      } else {
        setStatus({
          configured: false,
          hasAccessToken: false,
          apiKeySet: false,
          apiSecretSet: false,
        });
      }
    } catch {
      setStatus({
        configured: false,
        hasAccessToken: false,
        apiKeySet: false,
        apiSecretSet: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestFetch = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/kite/historical?symbol=${encodeURIComponent(testSymbol)}&interval=day&from=2024-01-01&to=2024-03-31`);
      const data = await res.json();
      if (res.ok && data.candles) {
        setTestResult(`✓ Successfully received ${data.candles.length} historical candles from ${data.source === 'live_kite' ? 'Zerodha Kite API' : 'Calibrated Sandbox'}!`);
      } else {
        setTestResult(`ℹ️ Result: ${data.message || data.error || 'Check Kite credentials'}`);
      }
    } catch (err: any) {
      setTestResult(`✗ Error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Key className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold uppercase tracking-wider text-emerald-500">Broker Data Gateway</span>
            <span>•</span>
            <span>Zerodha Kite Connect v3 API</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Live Broker Historical Data Integration
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Connect your official Zerodha developer account to stream 1-minute, hourly, or daily tick candles with official NSE instrument tokens.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={isLoading}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh API Status</span>
        </button>
      </div>

      {/* Connection Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-500 block uppercase font-semibold">API Key &amp; Secret</span>
          <div className="flex items-center space-x-2 mt-1">
            <div className={`w-2.5 h-2.5 rounded-full ${status?.apiKeySet ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-sm font-bold text-white">
              {status?.apiKeySet ? 'Configured in .env' : 'Not Set (Set in .env)'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            KITE_API_KEY &amp; KITE_API_SECRET
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-500 block uppercase font-semibold">Session Access Token</span>
          <div className="flex items-center space-x-2 mt-1">
            <div className={`w-2.5 h-2.5 rounded-full ${status?.hasAccessToken ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-sm font-bold text-white">
              {status?.hasAccessToken ? 'Active Daily Token' : 'Pending Login Token'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Generated daily via Kite OAuth redirect
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-500 block uppercase font-semibold">Gateway Mode</span>
          <div className="flex items-center space-x-2 mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">
              {status?.hasAccessToken ? 'Live Zerodha Direct' : 'Calibrated NSE Sandbox'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Zero downtime fallback enabled
          </span>
        </div>
      </div>

      {/* Interactive test fetcher */}
      <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 mb-6">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Test Historical Bar Retrieval</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Query historical candles for any NSE stock using its instrument token via the backend proxy.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={testSymbol}
            onChange={(e) => setTestSymbol(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          >
            {Object.keys(NSE_INSTRUMENT_MAP).map((sym) => (
              <option key={sym} value={sym}>
                {sym} (#{NSE_INSTRUMENT_MAP[sym].token})
              </option>
            ))}
          </select>

          <button
            onClick={handleTestFetch}
            disabled={isTesting}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Contacting Zerodha...</span>
              </>
            ) : (
              <>
                <span>Fetch Sample Candles</span>
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200">
            {testResult}
          </div>
        )}
      </div>

      {/* Terminal CLI Command Instruction */}
      <div className="p-5 rounded-xl bg-slate-950/40 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Run CLI Backtester with Kite Broker Data</span>
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          You can also run comprehensive backtests directly from your terminal using the npm script:
        </p>
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400">
          npm run backtest:kite --strategy=pairs_cointegration --pair=HDFCBANK_ICICIBANK
        </div>
      </div>
    </div>
  );
};
