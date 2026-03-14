"use client";

import React from 'react';
import { Sparkles, CheckCircle, XCircle } from 'lucide-react';

const AIProductSummaryCard = ({ initialData }) => {
  if (!initialData || !initialData.content) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900">AI Product Insights</h3>
      </div>

      <p className="text-gray-700 text-sm leading-relaxed mb-6">{initialData.content}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Pros
          </h4>
          <ul className="space-y-2">
            {initialData.pros?.map((pro, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 shrink-0" />
                {pro}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            Cons
          </h4>
          <ul className="space-y-2">
            {initialData.cons?.map((con, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-red-500 mt-1.5 shrink-0" />
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIProductSummaryCard;
