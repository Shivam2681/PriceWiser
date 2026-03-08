"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import Modal from "./Modal";
import AuthModal from "./AuthModal";
import { untrackProduct, isUserTrackingProduct } from "@/lib/actions/user";

export default function TrackButton({ productId, isTracking: initialIsTracking, userEmail, productTitle, productImage }) {
  const [isTracking, setIsTracking] = useState(initialIsTracking);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showUntrackModal, setShowUntrackModal] = useState(false);
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
      // Show confirmation modal before untracking
      setShowUntrackModal(true);
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
      setShowUntrackModal(false);
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
            isOpen={showTrackModal}
            onSuccess={handleTrackSuccess}
            onClose={() => setShowTrackModal(false)}
          />
        </div>
      )}

      {/* Untrack Confirmation Modal */}
      {showUntrackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Stop Tracking?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            {/* Product Info */}
            {productTitle && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  {productImage && (
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={productImage}
                        alt={productTitle}
                        fill
                        className="object-contain rounded-lg bg-white"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {productTitle}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      You will no longer receive price alerts
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowUntrackModal(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50"
              >
                Keep Tracking
              </button>
              <button
                onClick={handleUntrack}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Untracking...
                  </>
                ) : (
                  "Yes, Untrack"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
