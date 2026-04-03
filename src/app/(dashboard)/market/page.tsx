'use client';

import { SpotPriceChart } from '@/features/market/spot-price-chart';
import { Co2Panel } from '@/features/market/co2-panel';
import { RenewableForecast } from '@/features/market/renewable-forecast';

export default function MarketPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <SpotPriceChart />
      <Co2Panel />
      <RenewableForecast />
    </div>
  );
}
