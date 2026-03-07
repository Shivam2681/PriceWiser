import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserFavorites } from "@/lib/actions/user";
import Link from "next/link";
import Image from "next/image";
import FavoriteButton from "@/components/FavoriteButton";

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  const products = await getUserFavorites(session.user.id);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Favorites</h1>
          <p className="text-gray-600 mt-1">
            Products you have saved for later
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
        >
          <Image src="/assets/icons/search.svg" alt="add" width={20} height={20} />
          Browse Products
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image
              src="/assets/icons/black-heart.svg"
              alt="no favorites"
              width={32}
              height={32}
              className="opacity-50"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Save products you are interested in by clicking the heart icon on any product page.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            <Image src="/assets/icons/search.svg" alt="browse" width={20} height={20} />
            Browse Products
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

                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/products/${product._id}`}
                    className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    View Details
                  </Link>
                  <FavoriteButton 
                    productId={product._id.toString()} 
                    isFavorited={true}
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
