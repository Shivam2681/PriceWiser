import Image from 'next/image';
import Link from 'next/link';
import FavoriteButton from './FavoriteButton';

const ProductCard = ({ product }) => {

  const discount = product.discountRate || 
    Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100);
  
  const isLowestPrice = product.currentPrice === product.lowestPrice;
  const isPendingData = product.currentPrice === 0;
  
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
          
          {/* Pending Data Badge */}
          {isPendingData && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              Price Pending
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
