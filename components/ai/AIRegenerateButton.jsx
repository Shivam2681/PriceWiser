"use client";

import React, { useState } from 'react';
import { RotateCw, Sparkles } from 'lucide-react';
import { useSession } from "next-auth/react";
import AuthModal from "../AuthModal";
import toast from 'react-hot-toast';

const AIRegenerateButton = ({ productId, hasData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { data: session } = useSession();

  const handleAction = async () => {
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      // Always use forceRefresh: true when clicking the button
      const response = await fetch('/api/ai/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, forceRefresh: true }),
      });

      if (response.ok) {
        toast.success('AI insights generated successfully!');
        // Refresh the page to show the new data from DB
        window.location.reload();
      } else {
        toast.error('Failed to generate. Please try again later.');
      }
    } catch (error) {
      console.error('Error with AI action:', error);
      toast.error('Failed to generate. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // After login success, we can optionally trigger the AI action automatically
    // or let the user click again. Let's let them click again for clarity.
  };

  return (
    <>
      {hasData ? (
        <button
          onClick={handleAction}
          disabled={isGenerating}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Regenerating...' : 'Regenerate AI'}
        </button>
      ) : (
        <button
          onClick={handleAction}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-50 w-full sm:w-auto justify-center"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
          {isGenerating ? 'Generating...' : 'Get AI Suggestions'}
        </button>
      )}

      <AuthModal 
        isOpen={showAuthModal} 
        setIsOpen={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default AIRegenerateButton;
