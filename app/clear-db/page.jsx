"use client";

import { useState } from "react";
import { clearAllProducts } from "@/lib/actions";

export default function ClearDatabasePage() {
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState(null);

  const handleClearDatabase = async () => {
    if (!confirm("Are you sure you want to delete ALL products from the database?")) {
      return;
    }

    setIsClearing(true);
    try {
      const response = await clearAllProducts();
      setResult(response);
      alert(`Successfully deleted ${response.deletedCount} products!`);
    } catch (error) {
      console.error(error);
      alert("Failed to clear database. Check console for details.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Clear Database</h1>
        <p className="text-gray-600 mb-6">
          This will permanently delete all products from your MongoDB database.
          This action cannot be undone.
        </p>
        
        <button
          onClick={handleClearDatabase}
          disabled={isClearing}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isClearing ? "Clearing..." : "Clear All Data"}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
            ✅ Deleted {result.deletedCount} products
          </div>
        )}
      </div>
    </div>
  );
}
