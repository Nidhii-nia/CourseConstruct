'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Global API tracking system
const apiTracker = {
  pendingRequests: 0,
  isPageReady: false, // ADD THIS: Track if page is already loaded
  listeners: new Set(),
  
  addRequest() {
    if (!this.isPageReady) { // ONLY add if page isn't ready yet
      this.pendingRequests++;
      this.notifyListeners(true);
    }
  },
  
  removeRequest() {
    if (!this.isPageReady) { // ONLY remove if page isn't ready yet
      this.pendingRequests = Math.max(0, this.pendingRequests - 1);
      if (this.pendingRequests === 0) {
        setTimeout(() => {
          this.notifyListeners(false);
          this.markPageReady(); // Mark page as ready when no more requests
        }, 300);
      }
    }
  },
  
  notifyListeners(isLoading) {
    this.listeners.forEach(listener => listener(isLoading));
  },
  
  isLoading() {
    return this.pendingRequests > 0;
  },
  
  markPageReady() { // ADD THIS: Mark page as fully loaded
    this.isPageReady = true;
    this.pendingRequests = 0;
  },
  
  resetForNewRoute() { // ADD THIS: Reset for new route
    this.isPageReady = false;
    this.pendingRequests = 0;
  }
};

// Export functions to control loading
export function startLoading() {
  // Don't start loading if page is already ready
  if (!apiTracker.isPageReady) {
    apiTracker.addRequest();
  }
}

export function stopLoading() {
  // Only stop if we were actually loading
  if (!apiTracker.isPageReady) {
    apiTracker.removeRequest();
  }
}

export function RouteLoading(isLoading) {
  if (isLoading && !apiTracker.isPageReady) {
    apiTracker.addRequest();
  } else if (!apiTracker.isPageReady) {
    apiTracker.removeRequest();
  }
}

// Initialize API tracking on the window object
if (typeof window !== 'undefined') {
  window.__apiTracker = apiTracker;
  
  // Monkey patch fetch - BUT only track initial page load
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    // Only track if page isn't ready yet
    if (!apiTracker.isPageReady) {
      apiTracker.addRequest();
      
      const requestTimeout = setTimeout(() => {
        apiTracker.removeRequest();
      }, 3000);
      
      return originalFetch.apply(this, args)
        .then(response => {
          clearTimeout(requestTimeout);
          apiTracker.removeRequest();
          return response;
        })
        .catch(error => {
          clearTimeout(requestTimeout);
          apiTracker.removeRequest();
          throw error;
        });
    } else {
      // Page is already ready, just do normal fetch
      return originalFetch.apply(this, args);
    }
  };
}

// Main loader component
export default function RouteLoader() {
  const [isLoading, setIsLoading] = useState(false); // Start as false
  const [apiLoading, setApiLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Listen to API loading state
    const handleApiLoading = (loading) => {
      setApiLoading(loading);
      if (loading) {
        setProgress(30);
      } else {
        setProgress(100);
        setTimeout(() => setProgress(0), 300);
      }
    };
    
    apiTracker.listeners.add(handleApiLoading);
    
    return () => {
      apiTracker.listeners.delete(handleApiLoading);
    };
  }, []);

  useEffect(() => {
    // Reset for new route
    setIsLoading(true);
    setProgress(10);
    apiTracker.resetForNewRoute(); // RESET tracker for new route
    
    let mounted = true;
    
    const checkIfReady = () => {
      if (!mounted) return false;
      
      const domReady = document.readyState === 'complete';
      const imagesReady = Array.from(document.images).every(img => img.complete);
      const noApiRequests = apiTracker.pendingRequests === 0;
      
      return domReady && imagesReady && noApiRequests;
    };

    const tryHideLoader = () => {
      if (!mounted) return false;
      
      if (checkIfReady()) {
        setProgress(100);
        setTimeout(() => {
          if (mounted) {
            setIsLoading(false);
            setProgress(0);
            apiTracker.markPageReady(); // MARK PAGE AS READY
          }
        }, 300);
        return true;
      }
      return false;
    };

    // Progress animation - ONLY if loading
    let progressInterval;
    if (isLoading || apiLoading) {
      progressInterval = setInterval(() => {
        if (mounted && progress < 90) {
          setProgress(prev => prev + 10);
        }
      }, 200);
    }

    // Check if ready - ONLY ONCE after delay
    const initialCheck = setTimeout(() => {
      if (mounted) {
        tryHideLoader();
      }
    }, 500);

    // Listen for page load
    const handlePageLoad = () => {
      if (mounted) {
        setProgress(80);
        setTimeout(() => tryHideLoader(), 500);
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(handlePageLoad, 300);
    } else {
      window.addEventListener('load', handlePageLoad);
    }

    // Cleanup
    return () => {
      mounted = false;
      clearInterval(progressInterval);
      clearTimeout(initialCheck);
      window.removeEventListener('load', handlePageLoad);
    };
  }, [pathname, searchParams]);

  // Don't show if page is already marked as ready
  if (apiTracker.isPageReady) return null;
  
  // Don't show anything if no loading
  if (progress === 0 && !isLoading && !apiLoading) return null;

  return (
    <>
      {/* Top Loading Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-9999 bg-gray-200">
        <div 
          className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Mini loading indicator for API calls only */}
      {apiLoading && progress < 100 && (
        <div className="fixed top-3 right-3 z-9999">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-gray-200">
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium text-gray-700">
              { 'Loading...'}
            </span>
          </div>
        </div>
      )}
    </>
  );
}