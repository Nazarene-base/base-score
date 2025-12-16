'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Base?: {
      ready: () => void;
    };
  }
}

export default function BaseReady() {
  useEffect(() => {
    // Function to check if Base SDK is loaded and call ready
    const callBaseReady = () => {
      if (typeof window !== 'undefined' && window.Base?.ready) {
        try {
          window.Base.ready();
          console.log('✅ Base ready() called successfully!');
        } catch (error) {
          console.error('❌ Error calling Base.ready():', error);
        }
      } else {
        // Base SDK not loaded yet, try again in 100ms
        console.log('⏳ Waiting for Base SDK to load...');
        setTimeout(callBaseReady, 100);
      }
    };

    // Start checking for Base SDK
    callBaseReady();
  }, []);

  // This component doesn't render anything visible
  return null;
}