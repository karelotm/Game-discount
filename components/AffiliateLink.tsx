'use client';

import { ExternalLink } from 'lucide-react';
import { getAffiliateLink, trackClick } from '@/lib/affiliate';

interface AffiliateLinkProps {
  dealID: string;
  storeID?: string;
  storeName?: string;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export default function AffiliateLink({
  dealID,
  storeID,
  storeName = 'Unknown',
  children,
  className = '',
  showIcon = false,
}: AffiliateLinkProps) {
  function handleClick() {
    trackClick(dealID, storeName);
  }

  return (
    <a
      href={getAffiliateLink(dealID, storeID, storeName)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
      {showIcon && <ExternalLink className="inline-block ml-1 h-3 w-3" />}
    </a>
  );
}
