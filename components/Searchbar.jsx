"use client"

import { scrapeAndStoreProduct } from '@/lib/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const isValidAmazonURL = (url) => {
  if (!url) return false;
  
  let targetUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    targetUrl = `https://${url}`;
  }

  try {
    const parsedURL = new URL(targetUrl);
    const hostname = parsedURL.hostname;

    return hostname.includes('amazon.com') || 
           hostname.includes('amazon.in') || 
           hostname.includes('amazon.co.uk') ||
           hostname.includes('amazon.ca') ||
           hostname.includes('amzn.in') ||
           hostname.includes('amzn.to');
  } catch (error) {
    return false;
  }
};

const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isValidLink = isValidAmazonURL(searchPrompt);

    if (!isValidLink) {
      toast.error('Please provide a valid Amazon product link');
      return;
    }

    try {
      setIsLoading(true);
      const product = await scrapeAndStoreProduct(searchPrompt);
      
      if (product) {
        toast.success('Product added successfully!');
        setSearchPrompt('');
        router.refresh();
      } else {
        toast.error('Failed to add product. Please try again.');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'An error occurred while adding the product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Paste Amazon product link"
        className="searchbar-input"
        disabled={isLoading}
      />

      <button
        type="submit"
        className="searchbar-btn"
        disabled={searchPrompt === '' || isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Adding...
          </span>
        ) : (
          'Track Price'
        )}
      </button>
    </form>
  );
};

export default Searchbar;
