"use client";

import { useState } from "react";
import { untrackProduct } from "@/lib/actions/user";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function UntrackButton({ productId }) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleUntrack = async () => {
    if (!confirm("Are you sure you want to stop tracking this product?")) {
      return;
    }

    if (!session?.user?.id) {
      toast.error("Please sign in first");
      return;
    }

    setIsLoading(true);
    try {
      await untrackProduct(session.user.id, productId);
      toast.success("Product untracked successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to untrack product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleUntrack}
      disabled={isLoading}
      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50"
    >
      {isLoading ? "..." : "Untrack"}
    </button>
  );
}
