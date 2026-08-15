import { useEffect, useRef } from 'react';
import { AD_CONFIG } from '@/config/ads';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface GoogleAdSenseProps {
  className?: string;
  format?: string;
  responsive?: boolean;
}

export const GoogleAdSense = ({
  className = '',
  format = 'auto',
  responsive = true,
}: GoogleAdSenseProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!adRef.current || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet or blocked
    }
  }, []);

  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CONFIG.publisherId}
        data-ad-slot={AD_CONFIG.bannerSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};
