import Modal from "@/components/Modal";
import PriceInfoCard from "@/components/PriceInfoCard";
import ProductCard from "@/components/ProductCard";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import DeleteProductButton from "@/components/DeleteProductButton";
import FavoriteButton from "@/components/FavoriteButton";
import TrackButton from "@/components/TrackButton";
import AIPricePredictionCard from "@/components/ai/AIPricePredictionCard.jsx";
import AIProductSummaryCard from "@/components/ai/AIProductSummaryCard.jsx";
import ProductFeaturesCard from "@/components/ai/ProductFeaturesCard.jsx";
import AIRegenerateButton from "@/components/ai/AIRegenerateButton";
import { getProductById, getSimilarProducts } from "@/lib/actions"
import { isUserTrackingProduct } from "@/lib/actions/user";
import { formatNumber } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

async function ProductDetails({ params: { id } }) {
  const product = await getProductById(id);

  if (!product) redirect('/');

  const session = await getServerSession(authOptions);
  const isTracking = session?.user?.id 
    ? await isUserTrackingProduct(session.user.id, id)
    : false;

  const similarProducts = await getSimilarProducts(id);
  
  // Convert price history to plain objects for client component
  const plainPriceHistory = product.priceHistory?.map(item => ({
    price: item.price,
    date: item.date?.toISOString ? item.date.toISOString() : item.date,
  })) || [];

  return (
    <div className="product-container">
      <div className="flex flex-col xl:flex-row gap-8 sm:gap-12 lg:gap-16 xl:gap-28">
        <div className="product-image w-full xl:w-1/2">
          <Image 
            src={product.image}
            alt={product.title}
            width={580}
            height={400}
            className="mx-auto"
            priority
          />
        </div>

        <div className="flex-1 flex flex-col w-full xl:w-1/2">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-5 flex-wrap pb-4 sm:pb-6">
            <div className="flex flex-col gap-2 sm:gap-3 flex-1">
              <p className="text-lg sm:text-xl lg:text-[28px] text-secondary font-semibold leading-tight">
                {product.title}
              </p>

              <Link
                href={product.url}
                target="_blank"
                className="text-base text-black opacity-50"
              >
                Visit Product
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <FavoriteButton 
                productId={id}
                initialFavorited={false}
              />

              <div className="p-2 bg-white-200 rounded-10">
                <Image 
                  src="/assets/icons/share.svg"
                  alt="share"
                  width={20}
                  height={20}
                />
              </div>
            </div>
          </div>

          <div className="product-info">
            <div className="flex flex-col gap-1 sm:gap-2">
              <p className="text-2xl sm:text-3xl lg:text-[34px] text-secondary font-bold">
                {product.currency} {formatNumber(product.currentPrice)}
              </p>
              <p className="text-lg sm:text-xl lg:text-[21px] text-black opacity-50 line-through">
                {product.currency} {formatNumber(product.originalPrice)}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="product-stars">
                  <Image 
                    src="/assets/icons/star.svg"
                    alt="star"
                    width={16}
                    height={16}
                  />
                  <p className="text-sm text-primary-orange font-semibold">
                    {product.stars || '25'}
                  </p>
                </div>

                <div className="product-reviews">
                  <Image 
                    src="/assets/icons/comment.svg"
                    alt="comment"
                    width={16}
                    height={16}
                  />
                  <p className="text-sm text-secondary font-semibold">
                    {product.reviewsCount} Reviews
                  </p>
                </div>
              </div>

              <p className="text-sm text-black opacity-50">
                <span className="text-primary-green font-semibold">93% </span> of
                buyers have recommended this.
              </p>
            </div>
          </div>

          <div className="my-4 sm:my-7 flex flex-col gap-3 sm:gap-5">
            <div className="flex gap-3 sm:gap-5 flex-wrap">
              <PriceInfoCard 
                title="Current Price"
                iconSrc="/assets/icons/price-tag.svg"
                value={`${product.currency} ${formatNumber(product.currentPrice)}`}
              />
              <PriceInfoCard 
                title="Average Price"
                iconSrc="/assets/icons/chart.svg"
                value={`${product.currency} ${formatNumber(product.averagePrice)}`}
              />
              <PriceInfoCard 
                title="Highest Price"
                iconSrc="/assets/icons/arrow-up.svg"
                value={`${product.currency} ${formatNumber(product.highestPrice)}`}
              />
              <PriceInfoCard 
                title="Lowest Price"
                iconSrc="/assets/icons/arrow-down.svg"
                value={`${product.currency} ${formatNumber(product.lowestPrice)}`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
            <TrackButton 
              productId={id} 
              isTracking={isTracking}
              userEmail={session?.user?.email}
              productTitle={product.title}
              productImage={product.image}
            />
            {session?.user?.isAdmin && (
              <DeleteProductButton productId={id} />
            )}
          </div>
        </div>
      </div>

      {/* Price History Chart */}
      <div className="mt-10">
        <PriceHistoryChart 
          priceHistory={plainPriceHistory} 
          currency={product.currency}
          originalPrice={product.originalPrice}
        />
      </div>

      {/* AI Insights Section */}
      <div className="mt-12 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="section-text flex items-center gap-2">
            AI Powered Insights
            <span className="text-[10px] sm:text-xs font-normal text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 uppercase tracking-wider">Experimental</span>
          </h3>
          <div className="w-full sm:w-fit">
            <AIRegenerateButton productId={id} hasData={!!product.aiInsights?.summary?.content} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <AIPricePredictionCard productId={id} initialData={product.aiInsights?.pricePrediction} />
          <AIProductSummaryCard productId={id} initialData={product.aiInsights?.summary} />
        </div>
        
        <div className="w-full">
          <ProductFeaturesCard productId={id} initialData={product.aiInsights?.features} />
        </div>
      </div>

      <div className="flex flex-col gap-16 mt-10">
        {/* <div className="flex flex-col gap-5">
          <h3 className="text-2xl text-secondary font-semibold">
            Product Description
          </h3>

          <div className="flex flex-col gap-4">
            {product?.description?.split('\n')}
          </div>
        </div> */}

        <a 
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn w-fit mx-auto flex items-center justify-center gap-3 min-w-[200px]"
        >
          <Image 
            src="/assets/icons/bag.svg"
            alt="buy"
            width={22}
            height={22}
          />
          <span className="text-base text-white">Buy Now</span>
        </a>
      </div>

      {similarProducts && similarProducts?.length > 0 && (
        <div className="py-8 sm:py-14 flex flex-col gap-2 w-full">
          <p className="section-text">Similar Products</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mt-4 sm:mt-7 w-full">
            {similarProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default ProductDetails
