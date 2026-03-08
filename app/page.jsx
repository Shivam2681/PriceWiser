import HeroCarousel from "@/components/HeroCarousel"
import Searchbar from "@/components/Searchbar"
import Image from "next/image"
import { getAllProducts } from "@/lib/actions"
import ProductCard from "@/components/ProductCard"
import Link from "next/link"

const Home = async () => {
  const allProducts = await getAllProducts(20, 0);

  return (
    <>
      <section className="px-4 sm:px-6 md:px-12 lg:px-20 py-12 sm:py-16 lg:py-24">
        <div className="flex flex-col xl:flex-row gap-8 sm:gap-12 lg:gap-16">
          <div className="flex flex-col justify-center w-full xl:w-1/2"> 
            <p className="small-text">
              Smart Shopping Starts Here:
              <Image 
                src="/assets/icons/arrow-right.svg"
                alt="arrow-right"
                width={16}
                height={16}
              />
            </p>

            <h1 className="head-text">
              Unleash the Power of
              <span className="text-primary"> PriceWiser</span>
            </h1>

            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600">
              Track Amazon product prices effortlessly. Get instant alerts when prices drop and never miss a deal again.
            </p>

            <Searchbar />
          </div>

          <div className="w-full xl:w-1/2">
            <HeroCarousel />
          </div>
        </div>
      </section>

      <section className="trending-section">
        <div className="flex justify-between items-center mb-8">
          <h2 className="section-text">Trending Products</h2>
          {/* <Link 
            href="/products" 
            className="text-primary font-semibold hover:underline"
          >
            View All
          </Link> */}
        </div>

        {allProducts && allProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
            {allProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 p-8 rounded-full mb-6">
              <Image
                src="/assets/icons/search.svg"
                alt="No products"
                width={48}
                height={48}
                className="opacity-50"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products tracked yet
            </h3>
            <p className="text-gray-600 max-w-md mb-6">
              Start tracking products by pasting an Amazon product link above. We will monitor prices and alert you when they drop.
            </p>
          </div>
        )}
      </section>
    </>
  )
}

export default Home