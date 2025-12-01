'use client';

import { useEffect } from 'react';
import { startLoading, stopLoading, RouteLoading } from '@/app/components/RouteLoader';

export function useApiTracker() {
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
      // Track this API call
      startLoading();
      
      try {
        const response = await originalFetch.apply(this, args);
        return response;
      } finally {
        // Add delay to prevent flicker when multiple requests
        setTimeout(stopLoading, 300);
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);
}

export function useManualLoading(initialState = true) {
  useEffect(() => {
    if (initialState) {
      startLoading();
    }
    
    return () => {
      setTimeout(stopLoading, 200);
    };
  }, [initialState]);

  return {
    startLoading,
    stopLoading: () => setTimeout(stopLoading, 100)
  };
}

// Helper to track individual API calls
export function trackApiCall(promise) {
  startLoading();
  
  return promise
    .then(result => {
      setTimeout(stopLoading, 200);
      return result;
    })
    .catch(error => {
      setTimeout(stopLoading, 200);
      throw error;
    });
}