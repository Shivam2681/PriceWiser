import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserTrackedProducts } from "@/lib/actions/user";
import Link from "next/link";
import Image from "next/image";
import UntrackButton from "@/components/UntrackButton";

export default async function MyProductsPage() {
  const session = await getServerSession(authOptions);
  const products = await getUserTrackedProducts(session.user.id);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Products you are tracking for price alerts
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-lg font-semibold hover:bg-opacity-90 transition whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <span className="hidden sm:inline">Track New</span>
          <span className="sm:hidden">Track</span>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image
              src="/assets/icons/bag.svg"
              alt="no products"
              width={32}
              height={32}
              className="opacity-50"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No products tracked yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start tracking products to get notified when prices drop. Click the button below to add your first product.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            <Image src="/assets/icons/search.svg" alt="add" width={20} height={20} />
            Track Your First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product) => (
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
      )}
    </div>
  );
}
