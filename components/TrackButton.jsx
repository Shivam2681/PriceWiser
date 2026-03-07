"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "./Modal";
import AuthModal from "./AuthModal";
import { untrackProduct, isUserTrackingProduct } from "@/lib/actions/user";

export default function TrackButton({ productId, isTracking: initialIsTracking, userEmail }) {
  const [isTracking, setIsTracking] = useState(initialIsTracking);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // Check tracking status when session loads
  useEffect(() => {
    if (session?.user?.id) {
      isUserTrackingProduct(session.user.id, productId).then(setIsTracking);
    }
  }, [session, productId]);

  const handleClick = () => {
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }

    if (isTracking) {
      // Show confirmation before untracking
      if (confirm("Are you sure you want to stop tracking this product?")) {
        handleUntrack();
      }
    } else {
      // Show track modal
      setShowTrackModal(true);
    }
  };

  const handleUntrack = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      await untrackProduct(session.user.id, productId);
      setIsTracking(false);
      toast.success("Product untracked successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to untrack product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSuccess = () => {
    setIsTracking(true);
    setShowTrackModal(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`btn flex items-center gap-2 ${
          isTracking 
            ? "bg-red-500 hover:bg-red-600" 
            : ""
        }`}
      >
        {isLoading ? (
          <span>Loading...</span>
        ) : isTracking ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Untrack</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>Track</span>
          </>
        )}
      </button>

      <AuthModal 
        isOpen={showAuthModal} 
        setIsOpen={setShowAuthModal}
        onSuccess={() => setShowTrackModal(true)}
      />

      {showTrackModal && (
        <div className="fixed inset-0 z-50">
          <Modal 
            productId={productId}
            onSuccess={handleTrackSuccess}
            onClose={() => setShowTrackModal(false)}
          />
        </div>
      )}
    </>
  );
}
