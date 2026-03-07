import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllProducts } from "@/lib/actions";
import AdminProductCard from "@/components/AdminProductCard";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import Link from "next/link";
import Image from "next/image";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  const products = await getAllProducts(100, 0);
  
  // Convert products to plain objects for client components
  const plainProducts = products.map(product => ({
    _id: product._id.toString(),
    url: product.url,
    currency: product.currency,
    image: product.image,
    title: product.title,
    currentPrice: product.currentPrice,
    originalPrice: product.originalPrice,
    priceHistory: product.priceHistory?.map(item => ({
      price: item.price,
      date: item.date?.toISOString ? item.date.toISOString() : item.date,
    })) || [],
    discountRate: product.discountRate,
    category: product.category,
    reviewsCount: product.reviewsCount,
    stars: product.stars,
    isOutOfStock: product.isOutOfStock,
    users: product.users?.map(user => ({
      email: user.email,
      _id: user._id?.toString() || '',
    })) || [],
    lowestPrice: product.lowestPrice,
    highestPrice: product.highestPrice,
    averagePrice: product.averagePrice,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      {/* <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/assets/icons/logo.svg" alt="logo" width={28} height={28} />
                <span className="font-bold text-xl text-gray-900">PriceWise</span>
              </Link>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{session.user.name}</span>
              <AdminLogoutButton />
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage all products and monitor the platform
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm font-medium">Total Products</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{plainProducts.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm font-medium">Tracked Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {plainProducts.reduce((acc, p) => acc + (p.users?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm font-medium">Price Alerts Sent</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">All Products</h2>
          </div>
          
          {plainProducts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
              {plainProducts.map((product) => (
                <AdminProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
