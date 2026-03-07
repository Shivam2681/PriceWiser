"use client";

import { useState, useEffect } from "react";
import { addToFavorites, removeFromFavorites, isProductFavorited } from "@/lib/actions/user";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AuthModal from "./AuthModal";

export default function FavoriteButton({ productId, initialFavorited = false }) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // Check favorite status when session loads
  useEffect(() => {
    if (session?.user?.id) {
      isProductFavorited(session.user.id, productId).then(setIsFavorited);
    }
  }, [session, productId]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session?.user?.id) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorited) {
        await removeFromFavorites(session.user.id, productId);
        setIsFavorited(false);
        toast.success("Removed from favorites");
      } else {
        await addToFavorites(session.user.id, productId);
        setIsFavorited(true);
        toast.success("Added to favorites");
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update favorites");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => handleToggle(e)}
        disabled={isLoading}
        className={`p-2 rounded-lg transition ${
          isFavorited 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-white hover:bg-gray-100 border border-gray-200"
        }`}
      >
        <Image
          src="/assets/icons/red-heart.svg"
          alt={isFavorited ? "Remove from favorites" : "Add to favorites"}
          width={20}
          height={20}
          className={`${isFavorited ? "brightness-0 invert" : ""} ${isLoading ? "opacity-50" : ""}`}
        />
      </button>

      <AuthModal 
        isOpen={showAuthModal} 
        setIsOpen={setShowAuthModal}
      />
    </>
  );
}
