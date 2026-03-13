"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FavoriteButton from './FavoriteButton';
import { refreshProductPrice } from '@/lib/actions/product';

const ProductCard = ({ product }) => {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const discount = useMemo(() => product.discountRate || 
    Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100),
    [product.discountRate, product.originalPrice, product.currentPrice]);
  
  const isLowestPrice = useMemo(() => product.currentPrice === product.lowestPrice, [product.currentPrice, product.lowestPrice]);
  const isPendingData = useMemo(() => product.currentPrice === 0, [product.currentPrice]);

  const handleRefreshPrice = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const result = await refreshProductPrice(product._id.toString());
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to refresh price:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, product._id, router]);
  
  return (
    <div className="product-card group relative">
      {/* Favorite Button - Outside Link */}
      <div className="absolute bottom-24 sm:bottom-28 right-2 sm:right-3 z-10">
        <FavoriteButton 
          productId={product._id.toString()} 
          initialFavorited={false}
        />
      </div>

      <Link href={`/products/${product._id}`} className="block">
        <div className="product-card_img-container relative overflow-hidden">
          <Image 
            src={product.image}
            alt={product.title}
            width={200}
            height={200}
            className="product-card_img group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              -{discount}%
            </div>
          )}
          
          {/* Lowest Price Badge */}
          {isLowestPrice && !discount > 0 && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              Lowest
            </div>
          )}
          
          {/* Stock Status */}
          {product.isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
          
          {/* Pending Data Badge with Refresh Button */}
          {isPendingData && (
            <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
              <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                Price Pending
              </div>
              <button
                onClick={handleRefreshPrice}
                disabled={isRefreshing}
                className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 transition disabled:opacity-50"
              >
                {isRefreshing ? (
                  <>
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 sm:gap-2 p-2 sm:p-3">
          <h3 className="product-title group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <Image src="/assets/icons/star.svg" alt="rating" width={12} height={12} className="sm:w-[14px] sm:h-[14px]" />
              <span className="text-gray-600">{product.stars || '4.5'}</span>
            </div>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">{product.reviewsCount || 0} reviews</span>
          </div>

          <div className="flex justify-between items-start gap-2">
            <p className="text-black opacity-50 text-xs sm:text-sm capitalize truncate max-w-[40%]">
              {product.category}
            </p>

            <div className="text-right">
              {isPendingData ? (
                <p className="text-yellow-600 text-xs sm:text-sm font-semibold">
                  Price updating...
                </p>
              ) : (
                <>
                  <p className="text-black text-sm sm:text-lg font-bold">
                    {product?.currency}{product?.currentPrice}
                  </p>
                  {product.originalPrice > product.currentPrice && (
                    <p className="text-gray-400 text-xs sm:text-sm line-through">
                      {product?.currency}{product?.originalPrice}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Price Trend Indicator */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs">
            {product.priceHistory.length > 1 && (
              <>
                {product.priceHistory[product.priceHistory.length - 1].price < 
                 product.priceHistory[product.priceHistory.length - 2].price ? (
                  <span className="text-green-500 flex items-center gap-1">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Price dropped
                  </span>
                ) : (
                  <span className="text-gray-400">Price stable</span>
                )}
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard
