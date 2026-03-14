"use client";

import React, { useEffect, useState } from 'react';
import { ListChecks } from 'lucide-react';

const ProductFeaturesCard = ({ productId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await fetch(`/api/ai/product-features?productId=${productId}`);
        const result = await res.json();
        if (!result.error) setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatures();
  }, [productId]);

  if (loading) return <div className="animate-pulse bg-gray-100 h-48 rounded-xl" />;
  if (!data || Object.keys(data.specifications).length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <ListChecks className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900">Key Specifications</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(data.specifications).map(([key, value]) => (
          <div key={key} className="p-3 bg-gray-50 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">{key}</p>
            <p className="text-sm font-semibold text-gray-800">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductFeaturesCard;
