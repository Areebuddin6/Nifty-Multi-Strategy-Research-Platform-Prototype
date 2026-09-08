#!/bin/bash
# ==============================================================================
# Zerodha Kite Connect v3 - One-Go Multi-Decade Historical Data Downloader
# ==============================================================================
#
# Usage:
#   ./download_kite_data.sh [YEARS] [UNIVERSE] [LIMIT]
#
# Examples:
#   ./download_kite_data.sh 20                     # 20 years for NIFTY 50
#   ./download_kite_data.sh 30                     # 30 years (max available NSE history)
#   ./download_kite_data.sh 10 NIFTY_100           # 10 years for NIFTY 100
#   ./download_kite_data.sh 20 NIFTY_500 25        # 20 years for first 25 NIFTY 500 stocks
# ==============================================================================

set -e

YEARS=${1:-20}
UNIVERSE=${2:-NIFTY_50}
LIMIT=${3:-0}

echo "================================================================================"
echo " Starting Zerodha Kite Multi-Decade Historical Data Download"
echo " Horizon:  $YEARS Years"
echo " Universe: $UNIVERSE"
if [ "$LIMIT" -gt 0 ]; then
  echo " Limit:    $LIMIT stocks"
fi
echo "================================================================================"

CMD="npx tsx src/cli/downloadKiteData.ts --universe $UNIVERSE --years $YEARS"

if [ "$LIMIT" -gt 0 ]; then
  CMD="$CMD --limit $LIMIT"
fi

# Execute downloader with auto-chunking
$CMD

echo ""
echo "Historical data cached successfully in ./market_data_cache/"
echo "To run a backtest over this $YEARS-year period, run:"
echo "  npm run kite:backtest -- --years $YEARS --universe $UNIVERSE"
echo "================================================================================"
