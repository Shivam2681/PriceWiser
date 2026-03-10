import HeroCarousel from "@/components/HeroCarousel"
import Searchbar from "@/components/Searchbar"
import Image from "next/image"
import { getAllProducts } from "@/lib/actions"
import TrendingProducts from "@/components/TrendingProducts"

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

      <TrendingProducts products={allProducts} />
    </>
  )
}

export default Home