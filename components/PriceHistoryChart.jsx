"use client";

import { useMemo, useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function PriceHistoryChart({ priceHistory, currency, originalPrice }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  const data = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return [];
    
    return priceHistory.map((item, index) => {
      const date = new Date(item.date);
      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        price: item.price,
        index,
      };
    });
  }, [priceHistory]);

  if (!hasMounted) return null;

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <p className="text-gray-500 font-medium">No price history available</p>
          <p className="text-gray-400 text-sm mt-1">Track this product to see price trends</p>
        </div>
      </div>
    );
  }

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);

  function getPriceTrend(prices) { 
    if (prices.length < 2) return "stable"; 
  
    const current = prices[prices.length - 1]; 
    const previous = prices[prices.length - 2]; 
    const lowest = Math.min(...prices); 
  
    if (current === lowest) return "best"; 
    if (current < previous) return "dropping"; 
    if (current > previous) return "rising"; 
  
    return "stable"; 
  } 

  const trendStyles = { 
    best: { 
      text: "🔥 Best price in 30 days", 
      class: "bg-green-100 text-green-700" 
    }, 
    dropping: { 
      text: "📉 Price dropping", 
      class: "bg-blue-100 text-blue-700" 
    }, 
    rising: { 
      text: "📈 Price rising", 
      class: "bg-red-100 text-red-700" 
    }, 
    stable: { 
      text: "➖ Price stable", 
      class: "bg-gray-100 text-gray-600" 
    } 
  }; 

  const trend = getPriceTrend(prices);
  const maxPriceFromHistory = Math.max(...prices);
  // Use originalPrice if provided and higher than history max
  const maxPrice = originalPrice && originalPrice > maxPriceFromHistory ? originalPrice : maxPriceFromHistory;
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const currentPrice = prices[prices.length - 1];
  const priceChange = prices.length > 1 ? currentPrice - prices[0] : 0;
  const priceChangePercent = prices.length > 1 ? (priceChange / prices[0]) * 100 : 0;

  // Calculate domain with padding
  const priceRange = maxPrice - minPrice || 1;
  const yMin = Math.max(0, minPrice - priceRange * 0.1);
  const yMax = maxPrice + priceRange * 0.1;

  const stats = [
    { label: "Current", value: currentPrice, color: "text-blue-600" },
    { label: "Lowest", value: minPrice, color: "text-green-600" },
    { label: "Highest", value: maxPrice, color: "text-red-600", isOriginal: originalPrice && originalPrice > maxPriceFromHistory },
    { label: "Average", value: Math.round(avgPrice), color: "text-purple-600" },
  ];

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900">Price History</h3>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${trendStyles[trend].class}`}> 
              {trendStyles[trend].text} 
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              {data.length} data point{data.length !== 1 ? 's' : ''} tracked
            </p>
            {priceChange !== 0 && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                priceChange < 0 
                  ? "bg-green-50 text-green-700" 
                  : "bg-red-50 text-red-700"
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {priceChange < 0 ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  )}
                </svg>
                {Math.abs(priceChangePercent).toFixed(1)}% {priceChange < 0 ? 'decrease' : 'increase'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-4 bg-gray-50/50">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{stat.label}</p>
            <p className={`text-lg font-bold ${stat.color} mt-1`}>
              {currency}{stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="px-6 pb-6 pt-4">
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f3f4f6" 
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${currency}${(value / 1000).toFixed(0)}k`}
                domain={[yMin, yMax]}
                dx={-10}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl">
                        <p className="text-gray-400 text-xs mb-1">{data.fullDate}</p>
                        <p className="text-lg font-bold">
                          {currency}{payload[0].value?.toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine 
                y={avgPrice} 
                stroke="#9CA3AF" 
                strokeDasharray="5 5" 
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#priceGradient)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const isLowest = payload.price === minPrice;
                  return (
                    <circle 
                      key={`dot-${payload.index}`}
                      cx={cx} 
                      cy={cy} 
                      r={isLowest ? 6 : 4} 
                      fill={isLowest ? "#10B981" : "#3B82F6"} 
                      stroke="#fff" 
                      strokeWidth={2} 
                    />
                  );
                }}
                activeDot={{ r: 7, fill: "#2563EB", stroke: "#fff", strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Dashed line represents average price
        </p>
      </div>
    </div>
  );
}
