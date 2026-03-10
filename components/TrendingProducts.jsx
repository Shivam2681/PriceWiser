"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductSearch from "./ProductSearch";
import ProductCard from "./ProductCard";

export default function TrendingProducts({ products }) {
  const [filteredProducts, setFilteredProducts] = useState(products);

  return (
    <section className="trending-section">
      {/* Header with Search */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
        <h2 className="section-text">Trending Products</h2>
        
        {products.length > 0 && (
          <div className="w-full lg:w-auto lg:min-w-[300px]">
            <ProductSearch 
              products={products} 
              onFilter={setFilteredProducts}
              placeholder="Search trending products..."
            />
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredProducts.length !== products.length && (
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      )}

      {/* Products Grid */}
      {filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gray-100 p-8 rounded-full mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
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
            No products tracked yet
          </h3>
          <p className="text-gray-600 max-w-md mb-6">
            Start tracking products by pasting an Amazon product link above. We will monitor prices and alert you when they drop.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gray-100 p-8 rounded-full mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
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
          <p className="text-gray-600 max-w-md">
            Try adjusting your search terms
          </p>
        </div>
      )}
    </section>
  );
}
