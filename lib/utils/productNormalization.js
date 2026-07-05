function toPositiveNumber(value, fallback = 0) {
  const numericValue = Number(value);
  if (Number.isFinite(numericValue) && numericValue >= 0) {
    return numericValue;
  }

  const numericFallback = Number(fallback);
  return Number.isFinite(numericFallback) && numericFallback >= 0 ? numericFallback : 0;
}

function normalizeProductPayload(input = {}, fallback = {}) {
  const currentPrice = toPositiveNumber(
    input.currentPrice ?? input.price ?? fallback.currentPrice ?? fallback.price,
    0
  );
  const originalPrice = toPositiveNumber(
    input.originalPrice ?? fallback.originalPrice,
    currentPrice
  );
  const discountRate = toPositiveNumber(
    input.discountRate ?? input.discountPercentage ?? fallback.discountRate ?? fallback.discountPercentage,
    0
  );

  return {
    url: input.url ?? fallback.url ?? "",
    productId: input.productId ?? fallback.productId ?? "",
    source: input.source ?? fallback.source ?? "amazon",
    title: input.title ?? fallback.title ?? "Unknown Product",
    currentPrice,
    originalPrice: originalPrice || currentPrice,
    discountRate,
    currency: input.currency ?? fallback.currency ?? "₹",
    image: input.image ?? fallback.image ?? "/assets/icons/logo.svg",
    category: input.category ?? fallback.category ?? "General",
    reviewsCount: toPositiveNumber(input.reviewsCount ?? fallback.reviewsCount, 0),
    isOutOfStock: Boolean(input.isOutOfStock ?? fallback.isOutOfStock),
  };
}

function createInitialPriceStats(currentPrice, originalPrice) {
  const effectiveCurrent = toPositiveNumber(currentPrice, 0);
  const effectiveOriginal = toPositiveNumber(originalPrice, effectiveCurrent);
  const highestPrice = Math.max(effectiveCurrent, effectiveOriginal);

  return {
    priceHistory: [{ price: effectiveCurrent, date: new Date() }],
    lowestPrice: effectiveCurrent,
    highestPrice,
    averagePrice: effectiveCurrent,
  };
}

export {
  createInitialPriceStats,
  normalizeProductPayload,
  toPositiveNumber,
};
