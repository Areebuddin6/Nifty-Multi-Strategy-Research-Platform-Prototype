/**
 * Zerodha Kite Connect v3 Authentication & Historical Data Ingestion Hub
 * 
 * This module handles:
 * 1. Generating Kite Connect OAuth login URLs
 * 2. Exchanging request_token for daily access_token using SHA-256 checksum:
 *    checksum = SHA256(api_key + request_token + api_secret)
 * 3. Fetching real historical daily/minute OHLCV candles from Zerodha's endpoint:
 *    GET https://api.kite.trade/instruments/historical/{instrument_token}/{interval}?from={from}&to={to}
 * 4. Local storage and caching for offline or fast backtesting against real broker data.
 */

import { KiteCandle } from './types';

export interface KiteCredentials {
  apiKey: string;
  apiSecret: string;
  accessToken?: string;
  requestToken?: string;
  redirectUrl?: string;
}

export interface KiteUserProfile {
  user_id?: string;
  user_name?: string;
  user_shortname?: string;
  email?: string;
  broker?: string;
  avatar_url?: string;
}

export interface KiteSessionResponse {
  status: 'success' | 'error';
  data?: {
    user_id: string;
    user_name: string;
    user_shortname: string;
    email: string;
    user_type: string;
    broker: string;
    access_token: string;
    public_token: string;
    refresh_token?: string;
    login_time: string;
  };
  message?: string;
  error_type?: string;
}

export interface KiteHistoricalAPIResponse {
  status: 'success' | 'error';
  data?: {
    candles: [string, number, number, number, number, number, number?][];
  };
  message?: string;
  error_type?: string;
}

/**
 * Standard Zerodha Kite Connect Instrument Tokens for liquid NSE bluechips & benchmarks.
 */
export const NSE_INSTRUMENT_MAP: Record<string, { token: number; name: string; sector: string }> = {
  // Indices
  'NIFTY 50': { token: 256265, name: 'Nifty 50 Index', sector: 'Benchmark' },
  'NIFTY_50': { token: 256265, name: 'Nifty 50 Index', sector: 'Benchmark' },
  'NIFTY BANK': { token: 260105, name: 'Nifty Bank Index', sector: 'Banking' },
  
  // Banking & Financials
  'HDFCBANK': { token: 341249, name: 'HDFC Bank Ltd', sector: 'Banking' },
  'ICICIBANK': { token: 1270529, name: 'ICICI Bank Ltd', sector: 'Banking' },
  'SBIN': { token: 779521, name: 'State Bank of India', sector: 'Banking' },
  'KOTAKBANK': { token: 492033, name: 'Kotak Mahindra Bank Ltd', sector: 'Banking' },
  'AXISBANK': { token: 1510401, name: 'Axis Bank Ltd', sector: 'Banking' },
  'BAJFINANCE': { token: 81153, name: 'Bajaj Finance Ltd', sector: 'NBFC' },
  'BAJAJFINSV': { token: 4267265, name: 'Bajaj Finserv Ltd', sector: 'NBFC' },

  // Information Technology
  'TCS': { token: 295321, name: 'Tata Consultancy Services Ltd', sector: 'IT' },
  'INFY': { token: 408065, name: 'Infosys Ltd', sector: 'IT' },
  'WIPRO': { token: 969473, name: 'Wipro Ltd', sector: 'IT' },
  'HCLTECH': { token: 1850625, name: 'HCL Technologies Ltd', sector: 'IT' },
  'TECHM': { token: 3465729, name: 'Tech Mahindra Ltd', sector: 'IT' },

  // Heavyweights & Energy
  'RELIANCE': { token: 738561, name: 'Reliance Industries Ltd', sector: 'Conglomerate' },
  'ONGC': { token: 633601, name: 'Oil & Natural Gas Corp Ltd', sector: 'Oil & Gas' },
  'LT': { token: 2939649, name: 'Larsen & Toubro Ltd', sector: 'Infrastructure' },

  // Auto & FMCG
  'TATAMOTORS': { token: 884737, name: 'Tata Motors Ltd', sector: 'Automobile' },
  'M&M': { token: 519937, name: 'Mahindra & Mahindra Ltd', sector: 'Automobile' },
  'HINDUNILVR': { token: 356865, name: 'Hindustan Unilever Ltd', sector: 'FMCG' },
  'ITC': { token: 424961, name: 'ITC Ltd', sector: 'FMCG' },
};

/**
 * Generates the official Zerodha Kite Connect login authorization URL.
 */
export function getKiteLoginUrl(apiKey?: string, redirectUrl?: string): string {
  const key = apiKey || (typeof process !== 'undefined' && process.env?.KITE_API_KEY) || '';
  const base = 'https://kite.zerodha.com/connect/login?v=3';
  if (!key) return base;
  let url = `${base}&api_key=${encodeURIComponent(key)}`;
  if (redirectUrl) {
    url += `&redirect_params=${encodeURIComponent(redirectUrl)}`;
  }
  return url;
}

/**
 * Computes SHA-256 hex digest for both browser (crypto.subtle) and Node (crypto).
 */
export async function computeSHA256(message: string): Promise<string> {
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
      const crypto = await import('crypto');
      return crypto.createHash('sha256').update(message).digest('hex');
    } catch {
      // Fall through to standard Web Crypto API
    }
  }

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  throw new Error('No crypto implementation available for SHA-256 checksum calculation');
}

/**
 * Exchanges Kite request_token for a session access_token.
 */
export async function exchangeKiteToken(params: {
  apiKey: string;
  apiSecret: string;
  requestToken: string;
}): Promise<{ accessToken: string; profile: KiteUserProfile }> {
  const { apiKey, apiSecret, requestToken } = params;
  if (!apiKey || !apiSecret || !requestToken) {
    throw new Error('Missing required credentials: apiKey, apiSecret, and requestToken are all mandatory.');
  }

  const checksumInput = `${apiKey}${requestToken}${apiSecret}`;
  const checksum = await computeSHA256(checksumInput);

  const formData = new URLSearchParams();
  formData.append('api_key', apiKey);
  formData.append('request_token', requestToken);
  formData.append('checksum', checksum);

  const response = await fetch('https://api.kite.trade/session/token', {
    method: 'POST',
    headers: {
      'X-Kite-Version': '3',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  const json: KiteSessionResponse = await response.json();

  if (json.status !== 'success' || !json.data?.access_token) {
    throw new Error(json.message || `Kite token exchange failed with error_type: ${json.error_type || 'Unknown'}`);
  }

  return {
    accessToken: json.data.access_token,
    profile: {
      user_id: json.data.user_id,
      user_name: json.data.user_name,
      user_shortname: json.data.user_shortname,
      email: json.data.email,
      broker: json.data.broker,
    },
  };
}

/**
 * Fetches historical OHLCV candles from Zerodha Kite Connect API.
 */
export async function fetchKiteHistoricalData(params: {
  apiKey: string;
  accessToken: string;
  instrumentToken: number;
  interval?: 'minute' | '3minute' | '5minute' | '15minute' | '30minute' | '60minute' | 'day';
  from: string; // 'YYYY-MM-DD'
  to: string;   // 'YYYY-MM-DD'
}): Promise<KiteCandle[]> {
  const { apiKey, accessToken, instrumentToken, interval = 'day', from, to } = params;

  if (!apiKey || !accessToken) {
    throw new Error('API Key and Access Token are required to query Kite historical data.');
  }

  const url = `https://api.kite.trade/instruments/historical/${instrumentToken}/${interval}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Kite-Version': '3',
      'Authorization': `token ${apiKey}:${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Kite Historical API responded with status ${response.status}: ${errorText}`);
  }

  const json: KiteHistoricalAPIResponse = await response.json();

  if (json.status !== 'success' || !json.data?.candles) {
    throw new Error(json.message || 'Failed to retrieve candles from Kite Connect.');
  }

  const formatted: KiteCandle[] = json.data.candles.map(c => {
    const rawDate = c[0];
    const dateStr = typeof rawDate === 'string' ? rawDate.split('T')[0] : String(rawDate);
    return {
      date: dateStr,
      open: Number(c[1]),
      high: Number(c[2]),
      low: Number(c[3]),
      close: Number(c[4]),
      volume: Number(c[5] || 0),
    };
  });

  return formatted;
}

const KITE_STORAGE_KEY_CANDLES = 'nifty_platform_kite_historical_candles_v1';
const KITE_STORAGE_KEY_SESSION = 'nifty_platform_kite_session_v1';

export function getCachedBrokerData(): Record<string, KiteCandle[]> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(KITE_STORAGE_KEY_CANDLES);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveCachedBrokerData(data: Record<string, KiteCandle[]>): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(KITE_STORAGE_KEY_CANDLES, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save broker data to localStorage:', err);
  }
}

export function clearCachedBrokerData(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.removeItem(KITE_STORAGE_KEY_CANDLES);
}

export function saveKiteSession(session: { apiKey: string; accessToken: string; profile?: KiteUserProfile }): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(KITE_STORAGE_KEY_SESSION, JSON.stringify({
      ...session,
      savedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Failed to save Kite session:', err);
  }
}

export function loadKiteSession(): { apiKey: string; accessToken: string; profile?: KiteUserProfile; savedAt?: string } | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(KITE_STORAGE_KEY_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
