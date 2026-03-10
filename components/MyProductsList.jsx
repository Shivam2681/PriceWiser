"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductSearch from "./ProductSearch";
import UntrackButton from "./UntrackButton";

export default function MyProductsList({ products }) {
  const [filteredProducts, setFilteredProducts] = useState(products);

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="mb-6">
        <ProductSearch 
          products={products} 
          onFilter={setFilteredProducts}
          placeholder="Search your products..."
        />
      </div>

      {/* Results Count */}
      {filteredProducts.length !== products.length && (
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              <Link href={`/products/${product._id}`}>
                <div className="aspect-square bg-gray-50 p-4 flex items-center justify-center">
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={200}
                    height={200}
                    className="object-contain max-h-full"
                  />
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/products/${product._id}`}>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-primary transition">
                    {product.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-gray-900">
                    {product.currency}{product.currentPrice}
                  </span>
                  {product.originalPrice > product.currentPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {product.currency}{product.originalPrice}
                    </span>
                  )}
                </div>

                {product.priceHistory.length > 1 && (
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    {product.priceHistory[product.priceHistory.length - 1].price < 
                     product.priceHistory[product.priceHistory.length - 2].price ? (
                      <span className="text-green-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Price dropped
                      </span>
                    ) : (
                      <span className="text-gray-400">Price stable</span>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/products/${product._id}`}
                    className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    View Details
                  </Link>
                  <UntrackButton 
                    productId={product._id.toString()} 
                    productTitle={product.title}
                    productImage={product.image}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No products match your search
          </h3>
          <p className="text-gray-600">
            Try adjusting your search terms
          </p>
        </div>
      )}
    </div>
  );
}
