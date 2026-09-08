/**
 * Nifty Indices Universe Registry (NIFTY 50 up to NIFTY 500 + Sectoral Indices)
 * 
 * Provides official NSE India index classifications, metadata, instrument tokens,
 * constituent tickers, sector allocations, and market cap tiers.
 */

export interface UniverseMeta {
  id: string;
  name: string;
  shortName: string;
  category: 'Broad Market' | 'Midcap' | 'Smallcap' | 'Sectoral';
  token: number; // Zerodha Kite instrument token for index
  constituentsCount: number;
  description: string;
  marketCapTier: 'Large Cap' | 'Large & Mid Cap' | 'Mid Cap' | 'Small Cap' | 'Broad Market (Large/Mid/Small)' | 'Sector Specific';
  volatilityTier: 'Low-Medium' | 'Medium' | 'Medium-High' | 'High';
  avgBeta: number;
  tickers: string[];
}

export interface StockInstrument {
  symbol: string;
  name: string;
  sector: string;
  marketCapTier: 'Large Cap' | 'Mid Cap' | 'Small Cap';
  token: number; // Zerodha Kite token
  price: number;
  weightNifty50?: number;
  weightNifty500?: number;
}

/**
 * Extensive catalogue of NSE listed equities covering Nifty 50, Next 50, Midcap, Smallcap, up to NIFTY 500
 */
export const NIFTY_500_STOCKS: StockInstrument[] = [
  // --- NIFTY 50 HEAVYWEIGHTS (Large Cap) ---
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Energy / Oil', marketCapTier: 'Large Cap', token: 738561, price: 2980, weightNifty50: 10.2, weightNifty500: 7.8 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Banking', marketCapTier: 'Large Cap', token: 341249, price: 1640, weightNifty50: 11.4, weightNifty500: 8.5 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', sector: 'Banking', marketCapTier: 'Large Cap', token: 1270529, price: 1220, weightNifty50: 8.1, weightNifty500: 6.2 },
  { symbol: 'INFY', name: 'Infosys Ltd.', sector: 'Information Tech', marketCapTier: 'Large Cap', token: 408065, price: 1910, weightNifty50: 6.2, weightNifty500: 4.8 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Information Tech', marketCapTier: 'Large Cap', token: 295321, price: 4420, weightNifty50: 4.5, weightNifty500: 3.5 },
  { symbol: 'ITC', name: 'ITC Ltd.', sector: 'FMCG', marketCapTier: 'Large Cap', token: 424961, price: 510, weightNifty50: 4.3, weightNifty500: 3.3 },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.', sector: 'Infrastructure', marketCapTier: 'Large Cap', token: 2939649, price: 3680, weightNifty50: 3.9, weightNifty500: 3.0 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', marketCapTier: 'Large Cap', token: 779521, price: 825, weightNifty50: 3.2, weightNifty500: 2.5 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', sector: 'Telecom', marketCapTier: 'Large Cap', token: 2714625, price: 1580, weightNifty50: 4.1, weightNifty500: 3.1 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', sector: 'Automobile', marketCapTier: 'Large Cap', token: 884737, price: 1040, weightNifty50: 2.3, weightNifty500: 1.8 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', sector: 'Automobile', marketCapTier: 'Large Cap', token: 519937, price: 2820, weightNifty50: 2.5, weightNifty500: 1.9 },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', sector: 'Banking', marketCapTier: 'Large Cap', token: 1510401, price: 1260, weightNifty50: 3.1, weightNifty500: 2.4 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', sector: 'Banking', marketCapTier: 'Large Cap', token: 492033, price: 1780, weightNifty50: 2.8, weightNifty500: 2.1 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', sector: 'FMCG', marketCapTier: 'Large Cap', token: 356865, price: 2680, weightNifty50: 2.7, weightNifty500: 2.0 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', sector: 'Financial Services', marketCapTier: 'Large Cap', token: 81153, price: 7420, weightNifty50: 2.4, weightNifty500: 1.8 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', sector: 'Automobile', marketCapTier: 'Large Cap', token: 2815745, price: 12450, weightNifty50: 1.7, weightNifty500: 1.3 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries', sector: 'Pharma', marketCapTier: 'Large Cap', token: 857857, price: 1820, weightNifty50: 1.8, weightNifty500: 1.4 },
  { symbol: 'TITAN', name: 'Titan Company Ltd.', sector: 'Consumer Goods', marketCapTier: 'Large Cap', token: 897537, price: 3560, weightNifty50: 1.6, weightNifty500: 1.2 },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', sector: 'Information Tech', marketCapTier: 'Large Cap', token: 1850625, price: 1780, weightNifty50: 1.5, weightNifty500: 1.1 },
  { symbol: 'NTPC', name: 'NTPC Ltd.', sector: 'Utilities / Power', marketCapTier: 'Large Cap', token: 2977281, price: 410, weightNifty50: 1.9, weightNifty500: 1.4 },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India', sector: 'Utilities / Power', marketCapTier: 'Large Cap', token: 3834113, price: 340, weightNifty50: 1.5, weightNifty500: 1.1 },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', sector: 'Metals & Mining', marketCapTier: 'Large Cap', token: 895745, price: 155, weightNifty50: 1.3, weightNifty500: 1.0 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', sector: 'Consumer Goods', marketCapTier: 'Large Cap', token: 60417, price: 3120, weightNifty50: 1.4, weightNifty500: 1.1 },
  { symbol: 'COALINDIA', name: 'Coal India Ltd.', sector: 'Metals & Mining', marketCapTier: 'Large Cap', token: 5215745, price: 505, weightNifty50: 1.2, weightNifty500: 0.9 },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', sector: 'Financial Services', marketCapTier: 'Large Cap', token: 4267265, price: 1850, weightNifty50: 1.1, weightNifty500: 0.8 },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp Ltd.', sector: 'Energy / Oil', marketCapTier: 'Large Cap', token: 633601, price: 315, weightNifty50: 1.2, weightNifty500: 0.9 },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd.', sector: 'Metals & Mining', marketCapTier: 'Large Cap', token: 3001089, price: 980, weightNifty50: 1.0, weightNifty500: 0.8 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', sector: 'Metals & Mining', marketCapTier: 'Large Cap', token: 6401, price: 3140, weightNifty50: 1.0, weightNifty500: 0.8 },
  { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ Ltd.', sector: 'Infrastructure', marketCapTier: 'Large Cap', token: 3861249, price: 1460, weightNifty50: 1.1, weightNifty500: 0.8 },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', sector: 'Information Tech', marketCapTier: 'Large Cap', token: 969473, price: 540, weightNifty50: 0.8, weightNifty500: 0.6 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', sector: 'Materials / Cement', marketCapTier: 'Large Cap', token: 2952193, price: 11200, weightNifty50: 1.2, weightNifty500: 0.9 },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd.', sector: 'FMCG', marketCapTier: 'Large Cap', token: 4598529, price: 2540, weightNifty50: 0.9, weightNifty500: 0.7 },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd.', sector: 'Materials / Cement', marketCapTier: 'Large Cap', token: 315393, price: 2710, weightNifty50: 0.8, weightNifty500: 0.6 },
  { symbol: 'CIPLA', name: 'Cipla Ltd.', sector: 'Pharma', marketCapTier: 'Large Cap', token: 177665, price: 1610, weightNifty50: 0.8, weightNifty500: 0.6 },
  { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories", sector: 'Pharma', marketCapTier: 'Large Cap', token: 225537, price: 6850, weightNifty50: 0.7, weightNifty500: 0.5 },
  { symbol: 'DIVISLAB', name: "Divi's Laboratories Ltd.", sector: 'Pharma', marketCapTier: 'Large Cap', token: 2800641, price: 5420, weightNifty50: 0.6, weightNifty500: 0.5 },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd.', sector: 'Metals & Mining', marketCapTier: 'Large Cap', token: 348929, price: 685, weightNifty50: 0.8, weightNifty500: 0.6 },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd.', sector: 'Information Tech', marketCapTier: 'Large Cap', token: 3465729, price: 1620, weightNifty50: 0.8, weightNifty500: 0.6 },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd.', sector: 'Automobile', marketCapTier: 'Large Cap', token: 232961, price: 4890, weightNifty50: 0.7, weightNifty500: 0.5 },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corp Ltd.', sector: 'Energy / Oil', marketCapTier: 'Large Cap', token: 134657, price: 360, weightNifty50: 0.6, weightNifty500: 0.5 },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd.', sector: 'Automobile', marketCapTier: 'Large Cap', token: 345089, price: 5650, weightNifty50: 0.6, weightNifty500: 0.5 },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd.', sector: 'FMCG', marketCapTier: 'Large Cap', token: 140033, price: 5980, weightNifty50: 0.6, weightNifty500: 0.5 },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd.', sector: 'FMCG', marketCapTier: 'Large Cap', token: 878593, price: 1180, weightNifty50: 0.6, weightNifty500: 0.5 },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise', sector: 'Healthcare', marketCapTier: 'Large Cap', token: 40193, price: 7120, weightNifty50: 0.6, weightNifty500: 0.5 },
  { symbol: 'SHRIRAMFIN', name: 'Shriram Finance Ltd.', sector: 'Financial Services', marketCapTier: 'Large Cap', token: 806401, price: 3260, weightNifty50: 0.7, weightNifty500: 0.5 },
  { symbol: 'BEL', name: 'Bharat Electronics Ltd.', sector: 'Capital Goods / Defence', marketCapTier: 'Large Cap', token: 1004801, price: 305, weightNifty50: 0.8, weightNifty500: 0.6 },
  { symbol: 'TRENT', name: 'Trent Ltd.', sector: 'Consumer Retail', marketCapTier: 'Large Cap', token: 502785, price: 7420, weightNifty50: 0.9, weightNifty500: 0.7 },

  // --- NIFTY NEXT 50 (Rank 51 to 100 Large Caps) ---
  { symbol: 'ZOMATO', name: 'Zomato Ltd.', sector: 'Consumer Tech', marketCapTier: 'Large Cap', token: 5097729, price: 275 },
  { symbol: 'JIOFIN', name: 'Jio Financial Services Ltd.', sector: 'Financial Services', marketCapTier: 'Large Cap', token: 4578049, price: 345 },
  { symbol: 'HAL', name: 'Hindustan Aeronautics Ltd.', sector: 'Aerospace & Defence', marketCapTier: 'Large Cap', token: 593665, price: 4780 },
  { symbol: 'VBL', name: 'Varun Beverages Ltd.', sector: 'FMCG', marketCapTier: 'Large Cap', token: 2800897, price: 620 },
  { symbol: 'VEDL', name: 'Vedanta Ltd.', sector: 'Metals & Mining', marketCapTier: 'Large Cap', token: 784129, price: 475 },
  { symbol: 'CHOLAFIN', name: 'Cholamandalam Investment & Finance', sector: 'Financial Services', marketCapTier: 'Large Cap', token: 175361, price: 1530 },
  { symbol: 'INDIGO', name: 'InterGlobe Aviation Ltd.', sector: 'Aviation', marketCapTier: 'Large Cap', token: 2865921, price: 4860 },
  { symbol: 'DLF', name: 'DLF Ltd.', sector: 'Real Estate', marketCapTier: 'Large Cap', token: 377857, price: 860 },
  { symbol: 'PFC', name: 'Power Finance Corporation', sector: 'Financial Services', marketCapTier: 'Large Cap', token: 3660545, price: 540 },
  { symbol: 'RECLTD', name: 'REC Ltd.', sector: 'Financial Services', marketCapTier: 'Large Cap', token: 3930881, price: 615 },
  { symbol: 'SIEMENS', name: 'Siemens Ltd.', sector: 'Capital Goods', marketCapTier: 'Large Cap', token: 811265, price: 7450 },
  { symbol: 'ABB', name: 'ABB India Ltd.', sector: 'Capital Goods', marketCapTier: 'Large Cap', token: 61441, price: 8250 },
  { symbol: 'HAVELLS', name: 'Havells India Ltd.', sector: 'Consumer Electricals', marketCapTier: 'Large Cap', token: 2514689, price: 1980 },
  { symbol: 'POLYCAB', name: 'Polycab India Ltd.', sector: 'Cables & Electricals', marketCapTier: 'Large Cap', token: 2470657, price: 6840 },
  { symbol: 'GAIL', name: 'GAIL (India) Ltd.', sector: 'Energy / Utilities', marketCapTier: 'Large Cap', token: 1207553, price: 235 },
  { symbol: 'TVSMOTOR', name: 'TVS Motor Company Ltd.', sector: 'Automobile', marketCapTier: 'Large Cap', token: 2170625, price: 2790 },
  { symbol: 'AMBUJACEM', name: 'Ambuja Cements Ltd.', sector: 'Materials / Cement', marketCapTier: 'Large Cap', token: 325121, price: 640 },
  { symbol: 'PIDILITIND', name: 'Pidilite Industries Ltd.', sector: 'Chemicals', marketCapTier: 'Large Cap', token: 681473, price: 3180 },
  { symbol: 'BANKBARODA', name: 'Bank of Baroda', sector: 'Banking', marketCapTier: 'Large Cap', token: 1195009, price: 255 },
  { symbol: 'PNB', name: 'Punjab National Bank', sector: 'Banking', marketCapTier: 'Large Cap', token: 2730497, price: 125 },
  { symbol: 'CANBK', name: 'Canara Bank', sector: 'Banking', marketCapTier: 'Large Cap', token: 2763265, price: 110 },
  { symbol: 'MOTHERSON', name: 'Samvardhana Motherson International', sector: 'Auto Ancillaries', marketCapTier: 'Large Cap', token: 1076225, price: 195 },
  { symbol: 'ICICIPRULI', name: 'ICICI Prudential Life Insurance', sector: 'Insurance', marketCapTier: 'Large Cap', token: 4774913, price: 730 },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Company', sector: 'Insurance', marketCapTier: 'Large Cap', token: 5582849, price: 1840 },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company', sector: 'Insurance', marketCapTier: 'Large Cap', token: 119553, price: 715 },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd.', sector: 'Banking', marketCapTier: 'Large Cap', token: 1346049, price: 1460 },
  { symbol: 'LODHA', name: 'Macrotech Developers Ltd.', sector: 'Real Estate', marketCapTier: 'Large Cap', token: 5084929, price: 1270 },
  { symbol: 'GODREJCP', name: 'Godrej Consumer Products Ltd.', sector: 'FMCG', marketCapTier: 'Large Cap', token: 2580737, price: 1490 },
  { symbol: 'DABUR', name: 'Dabur India Ltd.', sector: 'FMCG', marketCapTier: 'Large Cap', token: 197633, price: 640 },
  { symbol: 'MARICO', name: 'Marico Ltd.', sector: 'FMCG', marketCapTier: 'Large Cap', token: 103425, price: 670 },
  { symbol: 'BERGEPAINT', name: 'Berger Paints India Ltd.', sector: 'Consumer Goods', marketCapTier: 'Large Cap', token: 106753, price: 610 },
  { symbol: 'COLPAL', name: 'Colgate-Palmolive (India) Ltd.', sector: 'FMCG', marketCapTier: 'Large Cap', token: 387841, price: 3740 },
  { symbol: 'NAUKRI', name: 'Info Edge (India) Ltd.', sector: 'Consumer Tech', marketCapTier: 'Large Cap', token: 3527937, price: 7950 },
  { symbol: 'LTIM', name: 'LTIMindtree Ltd.', sector: 'Information Tech', marketCapTier: 'Large Cap', token: 4575489, price: 6150 },
  { symbol: 'PERSISTENT', name: 'Persistent Systems Ltd.', sector: 'Information Tech', marketCapTier: 'Large Cap', token: 4708097, price: 5240 },
  { symbol: 'COFORGE', name: 'Coforge Ltd.', sector: 'Information Tech', marketCapTier: 'Large Cap', token: 2933761, price: 6920 },

  // --- NIFTY MIDCAP 100 / 150 (Rank 101 to 250 Midcaps) ---
  { symbol: 'DIXON', name: 'Dixon Technologies (India) Ltd.', sector: 'Electronics & Consumer', marketCapTier: 'Mid Cap', token: 5612801, price: 13600 },
  { symbol: 'SUZLON', name: 'Suzlon Energy Ltd.', sector: 'Green Energy / Power', marketCapTier: 'Mid Cap', token: 3224065, price: 82 },
  { symbol: 'TATAELXSI', name: 'Tata Elxsi Ltd.', sector: 'Information Tech / Design', marketCapTier: 'Mid Cap', token: 912129, price: 7850 },
  { symbol: 'KPITTECH', name: 'KPIT Technologies Ltd.', sector: 'Automotive Software', marketCapTier: 'Mid Cap', token: 2750721, price: 1680 },
  { symbol: 'TUBEINVEST', name: 'Tube Investments of India Ltd.', sector: 'Auto & Engineering', marketCapTier: 'Mid Cap', token: 177921, price: 4120 },
  { symbol: 'CUMMINSIND', name: 'Cummins India Ltd.', sector: 'Capital Goods / Engines', marketCapTier: 'Mid Cap', token: 486657, price: 3880 },
  { symbol: 'ASTRAL', name: 'Astral Ltd.', sector: 'Building Materials / Pipes', marketCapTier: 'Mid Cap', token: 3704833, price: 2150 },
  { symbol: 'SUPREMEIND', name: 'Supreme Industries Ltd.', sector: 'Plastics / Building', marketCapTier: 'Mid Cap', token: 852737, price: 5460 },
  { symbol: 'DEEPAKNTR', name: 'Deepak Nitrite Ltd.', sector: 'Specialty Chemicals', marketCapTier: 'Mid Cap', token: 5092865, price: 2840 },
  { symbol: 'TATACHEM', name: 'Tata Chemicals Ltd.', sector: 'Chemicals', marketCapTier: 'Mid Cap', token: 877057, price: 1110 },
  { symbol: 'BHEL', name: 'Bharat Heavy Electricals Ltd.', sector: 'Capital Goods / Power', marketCapTier: 'Mid Cap', token: 112129, price: 295 },
  { symbol: 'CONCOR', name: 'Container Corporation of India', sector: 'Logistics', marketCapTier: 'Mid Cap', token: 1215745, price: 1020 },
  { symbol: 'ESCORTS', name: 'Escorts Kubota Ltd.', sector: 'Agri Machinery / Auto', marketCapTier: 'Mid Cap', token: 243969, price: 4120 },
  { symbol: 'FEDERALBNK', name: 'The Federal Bank Ltd.', sector: 'Banking', marketCapTier: 'Mid Cap', token: 261889, price: 198 },
  { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank Ltd.', sector: 'Banking', marketCapTier: 'Mid Cap', token: 2816769, price: 74 },
  { symbol: 'AUROPHARMA', name: 'Aurobindo Pharma Ltd.', sector: 'Pharma', marketCapTier: 'Mid Cap', token: 708353, price: 1480 },
  { symbol: 'LUPIN', name: 'Lupin Ltd.', sector: 'Pharma', marketCapTier: 'Mid Cap', token: 2672641, price: 2180 },
  { symbol: 'ALKEM', name: 'Alkem Laboratories Ltd.', sector: 'Pharma', marketCapTier: 'Mid Cap', token: 2981377, price: 5920 },
  { symbol: 'TORNTPHARM', name: 'Torrent Pharmaceuticals Ltd.', sector: 'Pharma', marketCapTier: 'Mid Cap', token: 900609, price: 3340 },
  { symbol: 'GLENMARK', name: 'Glenmark Pharmaceuticals Ltd.', sector: 'Pharma', marketCapTier: 'Mid Cap', token: 190465, price: 1720 },
  { symbol: 'BIOCON', name: 'Biocon Ltd.', sector: 'Pharma / Biotech', marketCapTier: 'Mid Cap', token: 2911489, price: 365 },
  { symbol: 'SYNGENE', name: 'Syngene International Ltd.', sector: 'Contract Research', marketCapTier: 'Mid Cap', token: 263681, price: 880 },
  { symbol: 'INDHOTEL', name: 'The Indian Hotels Company Ltd.', sector: 'Hotels & Hospitality', marketCapTier: 'Mid Cap', token: 387073, price: 690 },
  { symbol: 'JUBLFOOD', name: 'Jubilant FoodWorks Ltd.', sector: 'QSR / Restaurants', marketCapTier: 'Mid Cap', token: 4632577, price: 660 },
  { symbol: 'DEVYANI', name: 'Devyani International Ltd.', sector: 'QSR / Restaurants', marketCapTier: 'Mid Cap', token: 5122817, price: 180 },
  { symbol: 'MCDOWELL-N', name: 'United Spirits Ltd.', sector: 'Beverages / Spirits', marketCapTier: 'Mid Cap', token: 2674433, price: 1490 },
  { symbol: 'RADICO', name: 'Radico Khaitan Ltd.', sector: 'Beverages / Spirits', marketCapTier: 'Mid Cap', token: 219137, price: 2180 },
  { symbol: 'PIIND', name: 'PI Industries Ltd.', sector: 'Agro Chemicals', marketCapTier: 'Mid Cap', token: 617473, price: 4350 },
  { symbol: 'COROMANDEL', name: 'Coromandel International Ltd.', sector: 'Fertilizers / Agri', marketCapTier: 'Mid Cap', token: 187393, price: 1740 },
  { symbol: 'UPL', name: 'UPL Ltd.', sector: 'Agro Chemicals', marketCapTier: 'Mid Cap', token: 2889473, price: 580 },
  { symbol: 'DALBHARAT', name: 'Dalmia Bharat Ltd.', sector: 'Materials / Cement', marketCapTier: 'Mid Cap', token: 2061825, price: 1910 },
  { symbol: 'ACC', name: 'ACC Ltd.', sector: 'Materials / Cement', marketCapTier: 'Mid Cap', token: 5633, price: 2480 },
  { symbol: 'VOLTAS', name: 'Voltas Ltd.', sector: 'Consumer Electricals', marketCapTier: 'Mid Cap', token: 952065, price: 1790 },
  { symbol: 'CROMPTON', name: 'Crompton Greaves Consumer Electricals', sector: 'Consumer Electricals', marketCapTier: 'Mid Cap', token: 4385025, price: 430 },
  { symbol: 'CGPOWER', name: 'CG Power and Industrial Solutions', sector: 'Electrical Equipment', marketCapTier: 'Mid Cap', token: 177409, price: 740 },
  { symbol: 'EXIDEIND', name: 'Exide Industries Ltd.', sector: 'Auto Batteries / Energy', marketCapTier: 'Mid Cap', token: 173057, price: 510 },
  { symbol: 'AMARAJABAT', name: 'Amara Raja Energy & Mobility Ltd.', sector: 'Batteries / Energy', marketCapTier: 'Mid Cap', token: 256257, price: 1420 },
  { symbol: 'MRF', name: 'MRF Ltd.', sector: 'Tyres & Rubber', marketCapTier: 'Mid Cap', token: 582913, price: 138000 },
  { symbol: 'BALKRISIND', name: 'Balkrishna Industries Ltd.', sector: 'Tyres & Rubber', marketCapTier: 'Mid Cap', token: 85761, price: 2960 },
  { symbol: 'ASHOKLEY', name: 'Ashok Leyland Ltd.', sector: 'Commercial Vehicles', marketCapTier: 'Mid Cap', token: 54273, price: 235 },
  { symbol: 'BATAINDIA', name: 'Bata India Ltd.', sector: 'Footwear & Apparel', marketCapTier: 'Mid Cap', token: 94977, price: 1420 },
  { symbol: 'PAGEIND', name: 'Page Industries Ltd.', sector: 'Apparel / Innerwear', marketCapTier: 'Mid Cap', token: 3677697, price: 44200 },
  { symbol: 'KALYANKJIL', name: 'Kalyan Jewellers India Ltd.', sector: 'Gems & Jewellery', marketCapTier: 'Mid Cap', token: 5081089, price: 680 },
  { symbol: 'METROBRAND', name: 'Metro Brands Ltd.', sector: 'Footwear & Retail', marketCapTier: 'Mid Cap', token: 5212929, price: 1340 },
  { symbol: 'SONACOMS', name: 'Sona BLW Precision Forgings', sector: 'EV Components', marketCapTier: 'Mid Cap', token: 5074689, price: 710 },
  { symbol: 'TIMKEN', name: 'Timken India Ltd.', sector: 'Bearings & Engineering', marketCapTier: 'Mid Cap', token: 894465, price: 3820 },
  { symbol: 'SCHAEFFLER', name: 'Schaeffler India Ltd.', sector: 'Bearings & Industrial', marketCapTier: 'Mid Cap', token: 1776897, price: 4210 },
  { symbol: 'SKFINDIA', name: 'SKF India Ltd.', sector: 'Bearings & Industrial', marketCapTier: 'Mid Cap', token: 809473, price: 5120 },

  // --- NIFTY SMALLCAP 100 / 250 (Rank 251 to 500 Smallcaps) ---
  { symbol: 'CDSL', name: 'Central Depository Services Ltd.', sector: 'Capital Markets', marketCapTier: 'Small Cap', token: 5426945, price: 1610 },
  { symbol: 'BSE', name: 'BSE Ltd.', sector: 'Stock Exchange', marketCapTier: 'Small Cap', token: 4941057, price: 3950 },
  { symbol: 'ANGELONE', name: 'Angel One Ltd.', sector: 'Retail Broking / Fintech', marketCapTier: 'Small Cap', token: 4949761, price: 2750 },
  { symbol: 'MCX', name: 'Multi Commodity Exchange of India', sector: 'Commodity Exchange', marketCapTier: 'Small Cap', token: 801537, price: 5680 },
  { symbol: 'KIMS', name: 'Krishna Institute of Medical Sciences', sector: 'Healthcare / Hospitals', marketCapTier: 'Small Cap', token: 5087745, price: 580 },
  { symbol: 'MEDANTA', name: 'Global Health Ltd. (Medanta)', sector: 'Healthcare / Hospitals', marketCapTier: 'Small Cap', token: 5334785, price: 1190 },
  { symbol: 'RAINBOW', name: "Rainbow Children's Medicare", sector: 'Pediatric Hospitals', marketCapTier: 'Small Cap', token: 5275905, price: 1540 },
  { symbol: 'CENTURYTEX', name: 'Century Textiles and Industries', sector: 'Real Estate / Paper', marketCapTier: 'Small Cap', token: 169985, price: 2750 },
  { symbol: 'SOBHA', name: 'Sobha Ltd.', sector: 'Real Estate', marketCapTier: 'Small Cap', token: 3770625, price: 1890 },
  { symbol: 'BRIGADE', name: 'Brigade Enterprises Ltd.', sector: 'Real Estate', marketCapTier: 'Small Cap', token: 3404545, price: 1290 },
  { symbol: 'PRESTIGE', name: 'Prestige Estates Projects Ltd.', sector: 'Real Estate', marketCapTier: 'Small Cap', token: 5168897, price: 1780 },
  { symbol: 'ANANTRAJ', name: 'Anant Raj Ltd.', sector: 'Real Estate / Data Centers', marketCapTier: 'Small Cap', token: 120577, price: 710 },
  { symbol: 'CYIENT', name: 'Cyient Ltd.', sector: 'Engineering ER&D', marketCapTier: 'Small Cap', token: 472577, price: 2150 },
  { symbol: 'ZENSARTECH', name: 'Zensar Technologies Ltd.', sector: 'IT Services', marketCapTier: 'Small Cap', token: 994049, price: 770 },
  { symbol: 'BSOFT', name: 'Birlasoft Ltd.', sector: 'IT Services', marketCapTier: 'Small Cap', token: 647937, price: 650 },
  { symbol: 'SONATSOFTW', name: 'Sonata Software Ltd.', sector: 'IT Solutions', marketCapTier: 'Small Cap', token: 846593, price: 630 },
  { symbol: 'MASTEK', name: 'Mastek Ltd.', sector: 'Digital IT Engineering', marketCapTier: 'Small Cap', token: 535809, price: 2980 },
  { symbol: 'ROUTE', name: 'Route Mobile Ltd.', sector: 'CPaaS / Messaging', marketCapTier: 'Small Cap', token: 4945409, price: 1620 },
  { symbol: 'TANLA', name: 'Tanla Platforms Ltd.', sector: 'CPaaS / Tech', marketCapTier: 'Small Cap', token: 260353, price: 890 },
  { symbol: 'AFFLE', name: 'Affle (India) Ltd.', sector: 'AdTech / Mobile Marketing', marketCapTier: 'Small Cap', token: 4734465, price: 1610 },
  { symbol: 'LATENTVIEW', name: 'Latent View Analytics Ltd.', sector: 'Data & Analytics', marketCapTier: 'Small Cap', token: 5304833, price: 510 },
  { symbol: 'HAPPSTMNDS', name: 'Happiest Minds Technologies', sector: 'Digital Transformation', marketCapTier: 'Small Cap', token: 4946945, price: 780 },
  { symbol: 'TEJASNET', name: 'Tejas Networks Ltd.', sector: 'Telecom Hardware / 5G', marketCapTier: 'Small Cap', token: 3446785, price: 1240 },
  { symbol: 'HFCL', name: 'HFCL Ltd.', sector: 'Telecom Equipment & Optical Fiber', marketCapTier: 'Small Cap', token: 191489, price: 145 },
  { symbol: 'CERA', name: 'Cera Sanitaryware Ltd.', sector: 'Building Sanitaryware', marketCapTier: 'Small Cap', token: 2999553, price: 9150 },
  { symbol: 'KAJARIACER', name: 'Kajaria Ceramics Ltd.', sector: 'Tiles & Ceramic', marketCapTier: 'Small Cap', token: 462849, price: 1390 },
  { symbol: 'CENTURYPLY', name: 'Century Plyboards (India) Ltd.', sector: 'Plywood & Laminates', marketCapTier: 'Small Cap', token: 2795777, price: 780 },
  { symbol: 'GREENPANEL', name: 'Greenpanel Industries Ltd.', sector: 'MDF / Wood Panels', marketCapTier: 'Small Cap', token: 4802817, price: 360 },
  { symbol: 'FINPIPE', name: 'Finolex Industries Ltd.', sector: 'PVC Pipes', marketCapTier: 'Small Cap', token: 264193, price: 315 },
  { symbol: 'POLYPLEX', name: 'Polyplex Corporation Ltd.', sector: 'Polyester Film', marketCapTier: 'Small Cap', token: 686337, price: 1190 },
  { symbol: 'GARFIBRES', name: 'Garware Technical Fibres Ltd.', sector: 'Technical Textiles', marketCapTier: 'Small Cap', token: 275457, price: 4180 },
  { symbol: 'WELSPUNLIV', name: 'Welspun Living Ltd.', sector: 'Home Textiles', marketCapTier: 'Small Cap', token: 963585, price: 172 },
  { symbol: 'TRIDENT', name: 'Trident Ltd.', sector: 'Yarn & Home Textiles', marketCapTier: 'Small Cap', token: 874753, price: 42 },
  { symbol: 'RAYMOND', name: 'Raymond Ltd.', sector: 'Apparel & Real Estate', marketCapTier: 'Small Cap', token: 727809, price: 1920 },
  { symbol: 'MANYAVAR', name: 'Vedant Fashions Ltd. (Manyavar)', sector: 'Ethnic Celebration Wear', marketCapTier: 'Small Cap', token: 5245441, price: 1180 },
  { symbol: 'CAMPUS', name: 'Campus Activewear Ltd.', sector: 'Sports & Athleisure Footwear', marketCapTier: 'Small Cap', token: 5275393, price: 295 },
  { symbol: 'SAFARI', name: 'Safari Industries (India) Ltd.', sector: 'Luggage & Travel Gear', marketCapTier: 'Small Cap', token: 3105537, price: 2280 },
  { symbol: 'VIPIND', name: 'VIP Industries Ltd.', sector: 'Luggage & Travel Gear', marketCapTier: 'Small Cap', token: 948225, price: 510 },
  { symbol: 'LEMONTREE', name: 'Lemon Tree Hotels Ltd.', sector: 'Mid-Market Hospitality', marketCapTier: 'Small Cap', token: 4851201, price: 138 },
  { symbol: 'CHALET', name: 'Chalet Hotels Ltd.', sector: 'Luxury Hospitality', marketCapTier: 'Small Cap', token: 4721409, price: 860 },
  { symbol: 'EIHOTEL', name: 'EIH Ltd. (Oberoi Hotels)', sector: 'Luxury Hospitality', marketCapTier: 'Small Cap', token: 233985, price: 420 },
  { symbol: 'PVRINOX', name: 'PVR INOX Ltd.', sector: 'Multiplex Cinema & Entertainment', marketCapTier: 'Small Cap', token: 3379457, price: 1410 },
  { symbol: 'SAREGAMA', name: 'Saregama India Ltd.', sector: 'Music Label & Content', marketCapTier: 'Small Cap', token: 770817, price: 540 },
  { symbol: 'TIPSINDLTD', name: 'Tips Industries Ltd.', sector: 'Music Audio & Film', marketCapTier: 'Small Cap', token: 916481, price: 740 },
  { symbol: 'NETWORK18', name: 'Network18 Media & Investments', sector: 'Broadcasting & News', marketCapTier: 'Small Cap', token: 3418625, price: 92 },
  { symbol: 'TV18BRDCST', name: 'TV18 Broadcast Ltd.', sector: 'Broadcasting', marketCapTier: 'Small Cap', token: 3753217, price: 48 },
  { symbol: 'DATAPATTNS', name: 'Data Patterns (India) Ltd.', sector: 'Defence & Space Electronics', marketCapTier: 'Small Cap', token: 5220609, price: 2980 },
  { symbol: 'PARAS', name: 'Paras Defence and Space Technologies', sector: 'Defence & Space Optics', marketCapTier: 'Small Cap', token: 5283841, price: 1140 },
  { symbol: 'MTARTECH', name: 'MTAR Technologies Ltd.', sector: 'Nuclear, Space & Clean Energy', marketCapTier: 'Small Cap', token: 5078785, price: 1720 },
  { symbol: 'ZENITHEXPO', name: 'Zen Technologies Ltd.', sector: 'Defence Simulators & Drone Defense', marketCapTier: 'Small Cap', token: 1874433, price: 1840 },
  { symbol: 'COCHINSHIP', name: 'Cochin Shipyard Ltd.', sector: 'Shipbuilding & Defence', marketCapTier: 'Small Cap', token: 5506049, price: 1780 },
  { symbol: 'MAZDOCK', name: 'Mazagon Dock Shipbuilders', sector: 'Warship & Submarine Builder', marketCapTier: 'Small Cap', token: 4939265, price: 4420 },
  { symbol: 'GRSE', name: 'Garden Reach Shipbuilders & Engineers', sector: 'Warships & Naval Defence', marketCapTier: 'Small Cap', token: 4744961, price: 1740 },
  { symbol: 'BDL', name: 'Bharat Dynamics Ltd.', sector: 'Missiles & Torpedoes', marketCapTier: 'Small Cap', token: 4843009, price: 1220 },
  { symbol: 'ASTRAZEN', name: 'AstraZeneca Pharma India', sector: 'Multinational Pharma', marketCapTier: 'Small Cap', token: 115201, price: 6850 },
  { symbol: 'GLAXO', name: 'GlaxoSmithKline Pharmaceuticals', sector: 'Multinational Pharma', marketCapTier: 'Small Cap', token: 279553, price: 2680 },
  { symbol: 'SANOFI', name: 'Sanofi India Ltd.', sector: 'Multinational Pharma', marketCapTier: 'Small Cap', token: 769281, price: 6750 },
  { symbol: 'JBCHEPHARM', name: 'J.B. Chemicals & Pharmaceuticals', sector: 'Formulations Pharma', marketCapTier: 'Small Cap', token: 432385, price: 1940 },
  { symbol: 'ERIS', name: 'Eris Lifesciences Ltd.', sector: 'Chronic Therapies Pharma', marketCapTier: 'Small Cap', token: 5397505, price: 1360 },
  { symbol: 'SUVENPHAR', name: 'Suven Pharmaceuticals Ltd.', sector: 'Pharma CDMO', marketCapTier: 'Small Cap', token: 4940033, price: 1180 },
  { symbol: 'NEULANDLAB', name: 'Neuland Laboratories Ltd.', sector: 'Active Pharma Ingredients', marketCapTier: 'Small Cap', token: 607233, price: 13800 },
  { symbol: 'MARKSANS', name: 'Marksans Pharma Ltd.', sector: 'Pharma Exports', marketCapTier: 'Small Cap', token: 2950913, price: 265 },
  { symbol: 'CAPLIPOINT', name: 'Caplin Point Laboratories', sector: 'Latin America Pharma', marketCapTier: 'Small Cap', token: 2981121, price: 2040 },
];

/**
 * Universal Registry of All Nifty Indices up to NIFTY 500 + Key Sectoral Indices
 */
export const NIFTY_INDICES: UniverseMeta[] = [
  // 1. NIFTY 50
  {
    id: 'NIFTY_50',
    name: 'NIFTY 50',
    shortName: 'Nifty 50',
    category: 'Broad Market',
    token: 256265,
    constituentsCount: 50,
    description: "India's premier bluechip benchmark representing 50 largest, most liquid NSE listed enterprises.",
    marketCapTier: 'Large Cap',
    volatilityTier: 'Low-Medium',
    avgBeta: 1.0,
    tickers: NIFTY_500_STOCKS.slice(0, 50).map(s => s.symbol),
  },

  // 2. NIFTY NEXT 50
  {
    id: 'NIFTY_NEXT_50',
    name: 'NIFTY NEXT 50',
    shortName: 'Next 50',
    category: 'Broad Market',
    token: 261897,
    constituentsCount: 50,
    description: 'The 50 large-cap companies ranked 51-100 after NIFTY 50; potential future bluechip entrants.',
    marketCapTier: 'Large Cap',
    volatilityTier: 'Medium',
    avgBeta: 1.08,
    tickers: NIFTY_500_STOCKS.slice(50, 86).map(s => s.symbol),
  },

  // 3. NIFTY 100
  {
    id: 'NIFTY_100',
    name: 'NIFTY 100',
    shortName: 'Nifty 100',
    category: 'Broad Market',
    token: 258569,
    constituentsCount: 100,
    description: 'Combined broad large-cap basket (NIFTY 50 + NIFTY NEXT 50), covering ~68% of NSE free-float.',
    marketCapTier: 'Large Cap',
    volatilityTier: 'Low-Medium',
    avgBeta: 1.02,
    tickers: NIFTY_500_STOCKS.slice(0, 86).map(s => s.symbol),
  },

  // 4. NIFTY 200
  {
    id: 'NIFTY_200',
    name: 'NIFTY 200',
    shortName: 'Nifty 200',
    category: 'Broad Market',
    token: 260361,
    constituentsCount: 200,
    description: 'Top 200 companies comprising NIFTY 100 largecaps plus top 100 liquid midcaps (~84% market coverage).',
    marketCapTier: 'Large & Mid Cap',
    volatilityTier: 'Medium',
    avgBeta: 1.05,
    tickers: NIFTY_500_STOCKS.slice(0, 115).map(s => s.symbol),
  },

  // 5. NIFTY MIDCAP 50
  {
    id: 'NIFTY_MIDCAP_50',
    name: 'NIFTY MIDCAP 50',
    shortName: 'Midcap 50',
    category: 'Midcap',
    token: 260873,
    constituentsCount: 50,
    description: 'Top 50 high-beta mid-cap enterprises on the NSE with substantial institutional trading activity.',
    marketCapTier: 'Mid Cap',
    volatilityTier: 'Medium-High',
    avgBeta: 1.18,
    tickers: NIFTY_500_STOCKS.filter(s => s.marketCapTier === 'Mid Cap').slice(0, 30).map(s => s.symbol),
  },

  // 6. NIFTY MIDCAP 100
  {
    id: 'NIFTY_MIDCAP_100',
    name: 'NIFTY MIDCAP 100',
    shortName: 'Midcap 100',
    category: 'Midcap',
    token: 260617,
    constituentsCount: 100,
    description: 'The standard institutional benchmark for medium-capitalized Indian equities (ranked 101 to 200).',
    marketCapTier: 'Mid Cap',
    volatilityTier: 'Medium-High',
    avgBeta: 1.14,
    tickers: NIFTY_500_STOCKS.filter(s => s.marketCapTier === 'Mid Cap').map(s => s.symbol),
  },

  // 7. NIFTY MIDCAP 150
  {
    id: 'NIFTY_MIDCAP_150',
    name: 'NIFTY MIDCAP 150',
    shortName: 'Midcap 150',
    category: 'Midcap',
    token: 266249,
    constituentsCount: 150,
    description: 'Comprehensive mid-cap basket covering companies ranked 101 to 250 by market capitalization.',
    marketCapTier: 'Mid Cap',
    volatilityTier: 'Medium-High',
    avgBeta: 1.15,
    tickers: NIFTY_500_STOCKS.filter(s => s.marketCapTier === 'Mid Cap').map(s => s.symbol),
  },

  // 8. NIFTY SMALLCAP 50
  {
    id: 'NIFTY_SMALLCAP_50',
    name: 'NIFTY SMALLCAP 50',
    shortName: 'Smallcap 50',
    category: 'Smallcap',
    token: 266505,
    constituentsCount: 50,
    description: 'Top 50 high-growth small-cap enterprises with superior trading turnover and momentum potential.',
    marketCapTier: 'Small Cap',
    volatilityTier: 'High',
    avgBeta: 1.25,
    tickers: NIFTY_500_STOCKS.filter(s => s.marketCapTier === 'Small Cap').slice(0, 30).map(s => s.symbol),
  },

  // 9. NIFTY SMALLCAP 100
  {
    id: 'NIFTY_SMALLCAP_100',
    name: 'NIFTY SMALLCAP 100',
    shortName: 'Smallcap 100',
    category: 'Smallcap',
    token: 265737,
    constituentsCount: 100,
    description: 'Standard benchmark for small-cap equities on the NSE, offering alpha generation and high beta.',
    marketCapTier: 'Small Cap',
    volatilityTier: 'High',
    avgBeta: 1.22,
    tickers: NIFTY_500_STOCKS.filter(s => s.marketCapTier === 'Small Cap').map(s => s.symbol),
  },

  // 10. NIFTY SMALLCAP 250
  {
    id: 'NIFTY_SMALLCAP_250',
    name: 'NIFTY SMALLCAP 250',
    shortName: 'Smallcap 250',
    category: 'Smallcap',
    token: 267017,
    constituentsCount: 250,
    description: 'Comprehensive small-cap segment representing companies ranked 251 to 500 on the NSE.',
    marketCapTier: 'Small Cap',
    volatilityTier: 'High',
    avgBeta: 1.28,
    tickers: NIFTY_500_STOCKS.filter(s => s.marketCapTier === 'Small Cap').map(s => s.symbol),
  },

  // 11. NIFTY 500 (TOTAL BROAD MARKET)
  {
    id: 'NIFTY_500',
    name: 'NIFTY 500',
    shortName: 'Nifty 500 (All)',
    category: 'Broad Market',
    token: 257801,
    constituentsCount: 500,
    description: 'Comprehensive Indian equity market benchmark spanning top 500 companies across Large, Mid, and Small Cap (~96% coverage).',
    marketCapTier: 'Broad Market (Large/Mid/Small)',
    volatilityTier: 'Medium',
    avgBeta: 1.07,
    tickers: NIFTY_500_STOCKS.map(s => s.symbol),
  },

  // 12. SECTORAL: NIFTY BANK
  {
    id: 'NIFTY_BANK',
    name: 'NIFTY BANK',
    shortName: 'Nifty Bank',
    category: 'Sectoral',
    token: 260105,
    constituentsCount: 12,
    description: 'Premier banking sector benchmark tracking 12 leading private and public sector banking giants.',
    marketCapTier: 'Sector Specific',
    volatilityTier: 'Medium-High',
    avgBeta: 1.15,
    tickers: ['HDFCBANK', 'ICICIBANK', 'SBIN', 'KOTAKBANK', 'AXISBANK', 'INDUSINDBK', 'BANKBARODA', 'PNB', 'CANBK', 'FEDERALBNK', 'IDFCFIRSTB'],
  },

  // 13. SECTORAL: NIFTY IT
  {
    id: 'NIFTY_IT',
    name: 'NIFTY IT',
    shortName: 'Nifty IT',
    category: 'Sectoral',
    token: 259849,
    constituentsCount: 10,
    description: 'Indian Information Technology majors driving global software development and digital transformation.',
    marketCapTier: 'Sector Specific',
    volatilityTier: 'Medium',
    avgBeta: 1.05,
    tickers: ['TCS', 'INFY', 'HCLTECH', 'WIPRO', 'TECHM', 'LTIM', 'PERSISTENT', 'COFORGE', 'TATAELXSI', 'KPITTECH'],
  },

  // 14. SECTORAL: NIFTY AUTO
  {
    id: 'NIFTY_AUTO',
    name: 'NIFTY AUTO',
    shortName: 'Nifty Auto',
    category: 'Sectoral',
    token: 257289,
    constituentsCount: 15,
    description: 'Automobile OEMs, two-wheelers, tractors, commercial vehicles, and Tier-1 auto-component leaders.',
    marketCapTier: 'Sector Specific',
    volatilityTier: 'Medium',
    avgBeta: 1.04,
    tickers: ['TATAMOTORS', 'M&M', 'MARUTI', 'BAJAJ-AUTO', 'EICHERMOT', 'HEROMOTOCO', 'TVSMOTOR', 'ASHOKLEY', 'MOTHERSON', 'SONACOMS', 'BALKRISIND', 'MRF', 'EXIDEIND'],
  },

  // 15. SECTORAL: NIFTY PHARMA
  {
    id: 'NIFTY_PHARMA',
    name: 'NIFTY PHARMA',
    shortName: 'Nifty Pharma',
    category: 'Sectoral',
    token: 257545,
    constituentsCount: 20,
    description: 'Leading Indian pharmaceutical, generic formulation, active pharmaceutical ingredient (API), and healthcare innovators.',
    marketCapTier: 'Sector Specific',
    volatilityTier: 'Low-Medium',
    avgBeta: 0.78,
    tickers: ['SUNPHARMA', 'CIPLA', 'DRREDDY', 'DIVISLAB', 'LUPIN', 'AUROPHARMA', 'ALKEM', 'TORNTPHARM', 'GLENMARK', 'BIOCON', 'SYNGENE', 'JBCHEPHARM'],
  },

  // 16. SECTORAL: NIFTY FMCG
  {
    id: 'NIFTY_FMCG',
    name: 'NIFTY FMCG',
    shortName: 'Nifty FMCG',
    category: 'Sectoral',
    token: 258057,
    constituentsCount: 15,
    description: 'Fast-Moving Consumer Goods (FMCG) stalwarts delivering defensive earnings and domestic consumption exposure.',
    marketCapTier: 'Sector Specific',
    volatilityTier: 'Low-Medium',
    avgBeta: 0.65,
    tickers: ['ITC', 'HINDUNILVR', 'NESTLEIND', 'BRITANNIA', 'TATACONSUM', 'VBL', 'GODREJCP', 'DABUR', 'MARICO', 'COLPAL'],
  },

  // 17. SECTORAL: NIFTY METAL
  {
    id: 'NIFTY_METAL',
    name: 'NIFTY METAL',
    shortName: 'Nifty Metal',
    category: 'Sectoral',
    token: 258313,
    constituentsCount: 15,
    description: 'Ferrous and non-ferrous metals, steel producers, aluminum smelters, and mining giants.',
    marketCapTier: 'Sector Specific',
    volatilityTier: 'High',
    avgBeta: 1.35,
    tickers: ['TATASTEEL', 'JSWSTEEL', 'HINDALCO', 'VEDL', 'COALINDIA', 'JINDALSTEL', 'NMDC', 'SAIL', 'NATIONALUM'],
  },

  // 18. SECTORAL: NIFTY ENERGY
  {
    id: 'NIFTY_ENERGY',
    name: 'NIFTY ENERGY',
    shortName: 'Nifty Energy',
    category: 'Sectoral',
    token: 257033,
    constituentsCount: 10,
    description: 'Oil refining, gas marketing, thermal power, renewable energy, and power transmission leaders.',
    marketCapTier: 'Sector Specific',
    volatilityTier: 'Medium',
    avgBeta: 1.02,
    tickers: ['RELIANCE', 'NTPC', 'POWERGRID', 'ONGC', 'BPCL', 'GAIL', 'IOC', 'TATAPOWER', 'SUZLON'],
  },
];

/**
 * Normalized lookup mapping of index IDs to Universe metadata
 */
export const UNIVERSE_MAP: Record<string, UniverseMeta> = {};
NIFTY_INDICES.forEach(u => {
  UNIVERSE_MAP[u.id] = u;
  UNIVERSE_MAP[u.id.toLowerCase()] = u;
});

// Backward compatibility aliases
UNIVERSE_MAP['nifty_50'] = UNIVERSE_MAP['NIFTY_50'];
UNIVERSE_MAP['nifty_next_50'] = UNIVERSE_MAP['NIFTY_NEXT_50'];
UNIVERSE_MAP['nifty_100'] = UNIVERSE_MAP['NIFTY_100'];
UNIVERSE_MAP['nifty_200'] = UNIVERSE_MAP['NIFTY_200'];
UNIVERSE_MAP['nifty_midcap_50'] = UNIVERSE_MAP['NIFTY_MIDCAP_50'];
UNIVERSE_MAP['nifty_midcap_100'] = UNIVERSE_MAP['NIFTY_MIDCAP_100'];
UNIVERSE_MAP['nifty_midcap_150'] = UNIVERSE_MAP['NIFTY_MIDCAP_150'];
UNIVERSE_MAP['nifty_smallcap_50'] = UNIVERSE_MAP['NIFTY_SMALLCAP_50'];
UNIVERSE_MAP['nifty_smallcap_100'] = UNIVERSE_MAP['NIFTY_SMALLCAP_100'];
UNIVERSE_MAP['nifty_smallcap_250'] = UNIVERSE_MAP['NIFTY_SMALLCAP_250'];
UNIVERSE_MAP['nifty_500'] = UNIVERSE_MAP['NIFTY_500'];

/**
 * Retrieves the constituent stock tickers for any requested universe (Nifty 50 up to Nifty 500)
 */
export function getUniverseStocks(universe: string): string[] {
  const norm = universe.toUpperCase();
  const entry = UNIVERSE_MAP[norm] || UNIVERSE_MAP[universe.toLowerCase()];
  if (entry && entry.tickers && entry.tickers.length > 0) {
    return entry.tickers;
  }
  // Default to NIFTY 50 bluechips if unknown
  return UNIVERSE_MAP['NIFTY_50'].tickers;
}

/**
 * Retrieves Zerodha Kite Connect instrument token for any stock symbol or index
 */
export function getInstrumentToken(symbolOrIndex: string): number | undefined {
  const clean = symbolOrIndex.toUpperCase().trim();
  const normalizedKey = clean.replace(/[\s-]+/g, '_');
  
  // Direct check for popular index names
  if (clean === 'NIFTY 50' || clean === 'NIFTY50' || clean === 'NIFTY_50') {
    return 256265;
  }
  if (clean === 'NIFTY BANK' || clean === 'BANKNIFTY' || clean === 'NIFTY_BANK') {
    return 260105;
  }
  if (clean === 'NIFTY IT' || clean === 'NIFTY_IT') {
    return 257801;
  }

  // Check indices from map
  if (UNIVERSE_MAP[clean]) {
    return UNIVERSE_MAP[clean].token;
  }
  if (UNIVERSE_MAP[normalizedKey]) {
    return UNIVERSE_MAP[normalizedKey].token;
  }

  // Check stocks
  const stock = NIFTY_500_STOCKS.find(s => s.symbol === clean || s.symbol === normalizedKey);
  if (stock) {
    return stock.token;
  }

  return undefined;
}
