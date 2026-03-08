"use server";

import { connectToDB } from "../mongoose";
import User from "../models/user.model";
import Product from "../models/product.models";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function getUserStats(userId) {
  try {
    await connectToDB();

    const user = await User.findById(userId);
    if (!user) {
      return { trackedProducts: 0, favorites: 0, priceDrops: 0 };
    }

    // Count tracked products
    const trackedProducts = user.trackedProducts?.length || 0;
    const favorites = user.favorites?.length || 0;

    // Count price drops (products where current price < previous price)
    let priceDrops = 0;
    if (user.trackedProducts?.length > 0) {
      const productIds = user.trackedProducts.map(tp => tp.product);
      const products = await Product.find({ _id: { $in: productIds } });
      
      priceDrops = products.filter(product => {
        if (product.priceHistory.length < 2) return false;
        const current = product.priceHistory[product.priceHistory.length - 1].price;
        const previous = product.priceHistory[product.priceHistory.length - 2].price;
        return current < previous;
      }).length;
    }

    return {
      trackedProducts,
      favorites,
      priceDrops,
    };
  } catch (error) {
    console.error("Get user stats error:", error);
    return { trackedProducts: 0, favorites: 0, priceDrops: 0 };
  }
}

export async function getUserTrackedProducts(userId) {
  try {
    await connectToDB();

    const user = await User.findById(userId).populate({
      path: 'trackedProducts.product',
      model: 'Product',
    });

    if (!user || !user.trackedProducts) {
      return [];
    }

    return user.trackedProducts.map(tp => ({
      ...tp.product.toObject(),
      addedAt: tp.addedAt,
      notifyEmail: tp.notifyEmail,
    }));
  } catch (error) {
    console.error("Get user tracked products error:", error);
    return [];
  }
}

export async function getUserFavorites(userId) {
  try {
    await connectToDB();

    const user = await User.findById(userId).populate({
      path: 'favorites',
      model: 'Product',
    });

    if (!user || !user.favorites) {
      return [];
    }

    return user.favorites;
  } catch (error) {
    console.error("Get user favorites error:", error);
    return [];
  }
}

export async function addToFavorites(userId, productId) {
  try {
    await connectToDB();

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if already in favorites
    if (user.favorites.includes(productId)) {
      return { success: true, message: "Already in favorites" };
    }

    user.favorites.push(productId);
    await user.save();

    return { success: true, message: "Added to favorites" };
  } catch (error) {
    console.error("Add to favorites error:", error);
    throw new Error(error.message || "Failed to add to favorites");
  }
}

export async function removeFromFavorites(userId, productId) {
  try {
    await connectToDB();

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.favorites = user.favorites.filter(
      (fav) => fav.toString() !== productId
    );
    await user.save();

    return { success: true, message: "Removed from favorites" };
  } catch (error) {
    console.error("Remove from favorites error:", error);
    throw new Error(error.message || "Failed to remove from favorites");
  }
}

export async function isProductFavorited(userId, productId) {
  try {
    await connectToDB();

    const user = await User.findById(userId);
    if (!user) return false;

    return user.favorites.includes(productId);
  } catch (error) {
    console.error("Check favorite error:", error);
    return false;
  }
}

export async function isUserTrackingProduct(userId, productId) {
  try {
    await connectToDB();

    const user = await User.findById(userId);
    if (!user) return false;

    return user.trackedProducts.some(
      (tp) => tp.product.toString() === productId
    );
  } catch (error) {
    console.error("Check tracking error:", error);
    return false;
  }
}

export async function untrackProduct(userId, productId) {
  try {
    await connectToDB();

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get product details before removing
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Find the tracked product entry to get the notifyEmail
    const trackedProductEntry = user.trackedProducts.find(
      (tp) => tp.product.toString() === productId
    );
    const notifyEmail = trackedProductEntry?.notifyEmail || user.email;

    user.trackedProducts = user.trackedProducts.filter(
      (tp) => tp.product.toString() !== productId
    );
    await user.save();

    // Also remove user from product's users list
    await Product.findByIdAndUpdate(productId, {
      $pull: { users: { email: notifyEmail } },
    });

    // Send untrack confirmation email
    if (notifyEmail) {
      const emailContent = await generateEmailBody(product, "UNTRACK");
      console.log('Sending untrack email to:', notifyEmail);
      await sendEmail(emailContent, [notifyEmail]);
      console.log('Untrack email sent successfully');
    }

    return { success: true, message: "Product untracked" };
  } catch (error) {
    console.error("Untrack product error:", error);
    throw new Error(error.message || "Failed to untrack product");
  }
}
