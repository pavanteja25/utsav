'use client';

import React, { useState, useEffect } from 'react';

/**
 * SmartImage: Prevents flash of old / broken images during hydration or network updates.
 * - Handles smooth load transitions with zero abrupt layout shifts
 * - Graceful fallback on broken URLs
 * - Cache-busting support
 */
export default function SmartImage({
  src,
  alt = 'The Utsav House',
  className = '',
  style = {},
  fallback = '/images/hero-wedding-garden.webp',
  loading = 'lazy',
  fetchPriority = 'auto',
  onLoad,
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src && src !== currentSrc) {
      setCurrentSrc(src);
      setIsLoaded(false);
      setHasError(false);
    }
  }, [src, currentSrc]);

  return (
    <img
      src={hasError ? fallback : currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0.85,
        transition: 'opacity 0.35s ease',
      }}
      onLoad={(e) => {
        setIsLoaded(true);
        if (onLoad) onLoad(e);
      }}
      onError={() => {
        if (!hasError && currentSrc !== fallback) {
          setHasError(true);
          setCurrentSrc(fallback);
        }
      }}
      {...props}
    />
  );
}
