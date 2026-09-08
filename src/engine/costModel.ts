/**
 * Exact implementation of engine/cost_model.py
 * Indian Equities Delivery Segment Round-Trip Cost Model.
 * 
 * Rates (NSE Equity Delivery):
 * - STT: 0.1% on Buy leg, 0.1% on Sell leg
 * - Stamp Duty: 0.015% on Buy leg only
 * - Exchange Turnover (NSE): 0.00297% on both legs
 * - SEBI Turnover Charge: ₹10 per crore (0.0001%) on both legs
 * - GST: 18% on (Brokerage + Exchange Fees + SEBI Charges)
 * - Brokerage: ₹0 (Discount broker delivery) or ₹20 per executed order
 */

import { TradeCost } from '../types';

export function calculateTradeCost(
  buyPrice: number,
  sellPrice: number,
  quantity: number,
  brokeragePerOrder: number = 0,
  slippageBps: number = 2 // basis points
): TradeCost {
  const turnoverBuy = buyPrice * quantity;
  const turnoverSell = sellPrice * quantity;
  const totalTurnover = turnoverBuy + turnoverSell;

  // Slippage impact
  const slippageDrag = (totalTurnover * slippageBps) / 10000;

  // 1. Securities Transaction Tax (STT)
  const stt = Math.round(0.001 * turnoverBuy) + Math.round(0.001 * turnoverSell);

  // 2. Stamp Duty (State Govt, Buy leg only)
  const stampDuty = 0.00015 * turnoverBuy;

  // 3. Exchange Transaction Charge (NSE: 0.00297%)
  const exchangeFees = 0.0000297 * totalTurnover;

  // 4. SEBI Turnover Charges (₹10 / crore = 0.000001)
  const sebiCharges = 0.000001 * totalTurnover;

  // 5. Brokerage (buy order + sell order)
  const brokerage = brokeragePerOrder * 2;

  // 6. GST: 18% on (Brokerage + Exchange fees + SEBI charges)
  const gstBase = brokerage + exchangeFees + sebiCharges;
  const gst = 0.18 * gstBase;

  const totalCost = stt + stampDuty + exchangeFees + sebiCharges + brokerage + gst + slippageDrag;
  const costPercent = totalTurnover > 0 ? (totalCost / totalTurnover) * 100 : 0;

  return {
    turnoverBuy,
    turnoverSell,
    totalTurnover,
    stt,
    stampDuty,
    exchangeFees,
    sebiCharges,
    brokerage,
    gst,
    totalCost,
    total: totalCost,
    costPercent,
  };
}
