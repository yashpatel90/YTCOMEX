import React, { useEffect, useRef } from 'react';

interface AdSenseUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  style?: React.CSSProperties;
}

export const AdSenseUnit: React.FC<AdSenseUnitProps> = ({ 
  slot, 
  format = 'auto', 
  style = { display: 'block' } 
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!adRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        
        // Only initialize if we have a width and haven't initialized yet
        if (width > 0 && !initialized.current) {
          try {
            // Check if the element hasn't been processed yet by AdSense
            if (adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
              // @ts-ignore
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              initialized.current = true;
              // Once initialized, we can stop observing
              observer.disconnect();
            }
          } catch (e) {
            if (e instanceof Error && !e.message.includes('already have ads')) {
              console.error("AdSense error", e);
            }
          }
        }
      }
    });

    observer.observe(adRef.current);

    return () => observer.disconnect();
  }, [slot]);

  return (
    <div className="my-8 flex justify-center w-full overflow-hidden min-h-[100px]">
      <ins 
           ref={adRef}
           className="adsbygoogle"
           style={{ ...style, width: '100%' }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your actual Publisher ID
           data-ad-slot={slot}
           data-ad-format={format}
           data-full-width-responsive="true"></ins>
    </div>
  );
};
