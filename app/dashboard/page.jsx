import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserStats } from "@/lib/actions/user";
import Link from "next/link";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const stats = await getUserStats(session.user.id);

  const statCards = [
    {
      title: "Products Tracking",
      value: stats.trackedProducts,
      icon: "/assets/icons/bag.svg",
      href: "/dashboard/products",
      color: "bg-blue-500",
    },
    {
      title: "Favorites",
      value: stats.favorites,
      icon: "/assets/icons/black-heart.svg",
      href: "/dashboard/favorites",
      color: "bg-red-500",
    },
    {
      title: "Price Drops",
      value: stats.priceDrops,
      icon: "/assets/icons/arrow-down.svg",
      href: "/dashboard/products",
      color: "bg-green-500",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Overview</h1>
      <p className="text-gray-600 mb-8">
        Track your products and manage your price alerts
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg shadow-sm`}>
                <Image
                  src={stat.icon}
                  alt={stat.title}
                  width={24}
                  height={24}
                  className="brightness-0 invert"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            Track New Product
          </Link>
          <Link
            href="/dashboard/favorites"
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            <Image src="/assets/icons/black-heart.svg" alt="favorites" width={20} height={20} />
            View Favorites
          </Link>
        </div>
      </div>
    </div>
  );
}
