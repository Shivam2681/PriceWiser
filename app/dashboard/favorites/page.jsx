import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserFavorites } from "@/lib/actions/user";
import Link from "next/link";
import Image from "next/image";
import FavoritesList from "@/components/FavoritesList";

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  const products = await getUserFavorites(session.user.id);

  if (products.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Favorites</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Products you have saved for later
          </p>
        </div>

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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Favorites</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Products you have saved for later
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
          <span className="hidden sm:inline">Browse Products</span>
          <span className="sm:hidden">Browse</span>
        </Link>
      </div>

      {/* Product List with Search */}
      <FavoritesList products={products} />
    </div>
  );
}
