import { useEffect, useRef, useState } from 'react';
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

// The committed publisher ID is an AdMob *app* ID (ca-app-pub-…), which
// AdSense for the web can never fill — rendering the slot only produces
// the grey broken box. So: don't render at all until a real AdSense
// publisher ID (ca-pub-…) is configured, and collapse the slot if an ad
// fails to fill (adblock, unapproved site, empty inventory).
const isAdSenseConfigured = AD_CONFIG.publisherId.startsWith('ca-pub-');

export const GoogleAdSense = ({
  className = '',
  format = 'auto',
  responsive = true,
}: GoogleAdSenseProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [visible, setVisible] = useState(isAdSenseConfigured);

  useEffect(() => {
    if (!isAdSenseConfigured) return;
    if (!adRef.current || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      setVisible(false);
      return;
    }
    // Collapse the slot if nothing fills it (blocked/empty inventory)
    const timer = setTimeout(() => {
      const el = adRef.current;
      if (!el) return;
      const filled = el.querySelector('iframe') !== null;
      if (!filled) setVisible(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

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
