'use client';

import React, { useEffect, useState } from 'react';
import { Cryptocurrency } from '@/services/api';
import CryptoItem from './CryptoItem';
import CryptoItemSkeleton from './CryptoItemSkeleton';

interface StickyTop10Props {
  cachedTop10: Cryptocurrency[];
  isLoading: boolean;
  hasFreshData: boolean;
  freshTop10: Cryptocurrency[];
}

const StickyTop10: React.FC<StickyTop10Props> = ({
  cachedTop10,
  isLoading,
  hasFreshData,
  freshTop10,
}) => {
  const [showCached, setShowCached] = useState(true);

  useEffect(() => {
    if (hasFreshData && showCached) {
      // Show cached data for a brief moment to allow UI transition
      const timer = setTimeout(() => {
        setShowCached(false);
      }, 100); // Small delay to make the transition smooth

      return () => clearTimeout(timer);
    }
  }, [hasFreshData, showCached]);

  // If we have fresh data and no longer need to show cached data
  if (!showCached && !isLoading && hasFreshData) {
    return (
      <>
        {freshTop10.map((crypto: Cryptocurrency) => (
          <CryptoItem key={`fresh-${crypto.id}`} crypto={crypto} />
        ))}
      </>
    );
  }

  // If we still need to show cached data or we're loading
  return (
    <>
      {isLoading && !cachedTop10.length
        ? Array.from({ length: 10 }).map((_, i) => <CryptoItemSkeleton key={`s-${i}`} />)
        : cachedTop10.map((crypto: Cryptocurrency) => (
            <CryptoItem key={`cached-${crypto.id}`} crypto={crypto} />
          ))}
    </>
  );
};

export default StickyTop10;
