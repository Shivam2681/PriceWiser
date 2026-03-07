"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { deleteProduct } from "@/lib/actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminProductCard({ product }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProduct(product._id);
      toast.success("Product deleted successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      <Link href={`/products/${product._id}`}>
        <div className="aspect-square bg-white p-4 flex items-center justify-center">
          <Image
            src={product.image}
            alt={product.title}
            width={150}
            height={150}
            className="object-contain max-h-full"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm hover:text-primary transition">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-gray-900">
            {product.currency}{product.currentPrice}
          </span>
          <span className="text-xs text-gray-500">
            {product.users?.length || 0} tracking
          </span>
        </div>

        <div className="flex gap-2 mt-3">
          <Link
            href={`/products/${product._id}`}
            className="flex-1 text-center py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            View
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
          >
            {isDeleting ? "..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
