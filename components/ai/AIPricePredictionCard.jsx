"use client";

import React from 'react';
import { TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';

const AIPricePredictionCard = ({ initialData }) => {
  if (!initialData || !initialData.prediction) return null;

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'BUY_NOW': return 'bg-green-100 text-green-700 border-green-200';
      case 'GOOD_DEAL': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'WAIT_FOR_DROP': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'OVERPRICED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isPositive = initialData.recommendation === 'BUY_NOW' || initialData.recommendation === 'GOOD_DEAL';

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900">AI Price Prediction</h3>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <p className="text-gray-600 text-sm flex-1 mr-4">{initialData.prediction}</p>
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getRecommendationColor(initialData.recommendation)}`}>
            {initialData.recommendation.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-gray-50 p-3 rounded-xl">
            <p className="text-[10px] text-gray-500 mb-1 uppercase font-bold tracking-tight">Expected Price</p>
            <p className="text-lg font-bold text-gray-900">₹{initialData.expectedPrice.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <p className="text-[10px] text-gray-500 mb-1 uppercase font-bold tracking-tight">AI Confidence</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-gray-900">{initialData.confidence}%</p>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600" 
                  style={{ width: `${initialData.confidence}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${isPositive ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
          {isPositive ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <p className="font-medium text-xs">
            {isPositive ? "Great time to buy!" : "Consider waiting for a better deal."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIPricePredictionCard;
