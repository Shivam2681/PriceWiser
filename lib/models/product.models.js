import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  currency: { type: String, required: true },
  image: { type: String, required: true },
  title: { type: String, required: true, index: 'text' },
  currentPrice: { type: Number, required: true, index: true },
  originalPrice: { type: Number, required: true },
  priceHistory: [
    { 
      price: { type: Number, required: true },
      date: { type: Date, default: Date.now }
    },
  ],
  lowestPrice: { type: Number, index: true },
  highestPrice: { type: Number },
  averagePrice: { type: Number },
  discountRate: { type: Number, index: true },
  category: { type: String, index: true },
  reviewsCount: { type: Number },
  isOutOfStock: { type: Boolean, default: false, index: true },
  users: [
    {email: { type: String, required: true }}
  ],
  aiInsights: {
    type: {
      pricePrediction: { type: Object, default: null },
      summary: { type: Object, default: null },
      features: { type: Object, default: null }
    },
    default: {}
  }
}, { timestamps: true });

// Compound indexes for common queries
productSchema.index({ category: 1, currentPrice: 1 });
productSchema.index({ discountRate: -1, currentPrice: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'users.email': 1 });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
