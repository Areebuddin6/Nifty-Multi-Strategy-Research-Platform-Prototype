import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Database, 
  ExternalLink, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

export const KiteBrokerConnectView: React.FC = () => {
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'checking' | 'connected' | 'unconfigured'>('idle');
  const [cacheInfo, setCacheInfo] = useState<{
    exists: boolean;
    totalFiles: number;
    symbols: string[];
    totalCandles: number;
    minDate: string | null;
    maxDate: string | null;
    yearsCovered: number;
  } | null>(null);

  const envTemplate = `# Zerodha Kite Connect v3 API Configuration
# Get your API Key and Secret from https://kite.trade/
KITE_API_KEY=your_zerodha_api_key_here
KITE_API_SECRET=your_zerodha_api_secret_here
KITE_ACCESS_TOKEN=your_generated_access_token_here`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    if (id === 'env') {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    } else {
      setCopiedCommand(id);
      setTimeout(() => setCopiedCommand(null), 2000);
    }
  };

  const handleTestConnection = async () => {
    setStatus('checking');
    try {
      const [resStatus, resCache] = await Promise.all([
        fetch('/api/kite/status').then(r => r.json()).catch(() => ({ configured: false })),
        fetch('/api/kite/cache-status').then(r => r.json()).catch(() => null)
      ]);

      if (resStatus?.configured) {
        setStatus('connected');
      } else {
        setStatus('unconfigured');
      }

      if (resCache) {
        setCacheInfo(resCache);
      }
    } catch {
      setStatus('unconfigured');
    }
  };

  // Check on mount
  React.useEffect(() => {
    handleTestConnection();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <Key className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold uppercase tracking-wider text-emerald-500">
                Zerodha Kite Connect v3
              </span>
              <span>•</span>
              <span>Multi-Decade Broker Historical Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Institutional Broker API & 10–30 Year Ingestion
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Stream live daily and minute candles directly from the National Stock Exchange of India via Zerodha Kite with automatic 365-day chunking.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-mono ${
              status === 'connected'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : status === 'checking'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              {status === 'connected' ? '● Kite API Configured' : status === 'checking' ? 'Checking...' : '○ Standalone / Fallback Mode'}
            </span>

            <button
              onClick={handleTestConnection}
              disabled={status === 'checking'}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status === 'checking' ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>

        {/* Local Market Data Cache Status */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Local Disk Cache (market_data_cache/)</h3>
            </div>
            {cacheInfo && cacheInfo.yearsCovered > 0 && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                {cacheInfo.yearsCovered} Years Ingested ({cacheInfo.minDate} to {cacheInfo.maxDate})
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Cached Files</span>
              <span className="text-slate-100 font-mono font-bold text-sm">
                {cacheInfo?.totalFiles || 0} Instruments
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Total Stored Candles</span>
              <span className="text-slate-100 font-mono font-bold text-sm">
                {(cacheInfo?.totalCandles || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Earliest Date</span>
              <span className="text-slate-100 font-mono font-bold text-sm">
                {cacheInfo?.minDate || 'None yet'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Latest Date</span>
              <span className="text-slate-100 font-mono font-bold text-sm">
                {cacheInfo?.maxDate || 'None yet'}
              </span>
            </div>
          </div>
        </div>

        {/* One-Go Ingestion Commands */}
        <div className="mt-6 space-y-4 text-xs text-slate-300">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2 text-white font-bold text-sm">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>One-Go Multi-Decade CLI Execution</span>
            </div>
            <p className="text-slate-400 text-xs mb-3 leading-relaxed">
              Kite Connect limits daily candle requests to 365 days per API call. Our built-in ingestors automatically slice multi-decade date ranges into consecutive chunks, throttles requests at 350ms to respect Kite's 3 req/sec rate limit, and caches all candles to disk for instant subsequent backtests.
            </p>

            <div className="space-y-2 font-mono">
              {[
                { id: 'onego', cmd: 'npm run kite:one-go', desc: 'Interactive One-Go Pipeline (Auth + Download + Backtest)' },
                { id: 'sh', cmd: './download_kite_data.sh 30', desc: 'One-liner shell script: Download 30 Years of NIFTY 50' },
                { id: '30y', cmd: 'npm run kite:download:30y', desc: 'Download 30 Years (1996–2026 / max available NSE history)' },
                { id: '20y', cmd: 'npm run kite:download:20y', desc: 'Download 20 Years (2006–2026 • Covers 2008 Lehman GFC)' },
                { id: '10y', cmd: 'npm run kite:download:10y', desc: 'Download 10 Years (2016–2026 • Demonetization, GST, COVID)' },
                { id: 'bt30y', cmd: 'npm run kite:backtest:30y', desc: 'Run 30-Year Institutional Backtest on downloaded data' },
              ].map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between bg-slate-900 border border-slate-800/80 rounded-lg p-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-xs">$</span>
                    <span className="text-emerald-300 text-xs font-semibold">{item.cmd}</span>
                    <span className="text-slate-500 font-sans text-[11px] hidden sm:inline">• {item.desc}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(item.cmd, item.id)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-emerald-400 text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer transition font-sans"
                  >
                    {copiedCommand === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCommand === item.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
              <span>Zerodha Kite Connect v3 Setup Steps</span>
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-400 leading-relaxed">
              <li>
                Create an app at <a href="https://kite.trade" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline inline-flex items-center">kite.trade <ExternalLink className="w-3 h-3 ml-1" /></a> to obtain your <strong>API Key</strong> and <strong>API Secret</strong>.
              </li>
              <li>
                Set your Redirect URL in your Kite developer app to: <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">http://127.0.0.1:3000/api/kite/callback</code>.
              </li>
              <li>
                Generate your daily <strong>Access Token</strong> in one command: <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">npm run kite:auth</code>.
              </li>
            </ol>
          </div>

          {/* Environment Snippet */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-slate-400 text-[11px] font-sans">Environment Variables Declaration (.env)</span>
              <button
                onClick={() => handleCopy(envTemplate, 'env')}
                className="flex items-center space-x-1 text-slate-400 hover:text-emerald-400 text-[11px] cursor-pointer"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEnv ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-emerald-400 text-xs overflow-x-auto select-all">
              {envTemplate}
            </pre>
          </div>

          {/* Fallback Guarantee */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-200">Point-in-Time Offline Fallback Active: </strong>
              If you do not have Kite API credentials configured yet, the platform seamlessly runs with our verified, split-adjusted Nifty 50 historical candle dataset with zero interruption.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
