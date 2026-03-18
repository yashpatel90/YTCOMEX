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
    // Small delay to ensure container width is calculated and avoid "availableWidth=0"
    const timer = setTimeout(() => {
      if (initialized.current) return;
      
      try {
        // Check if the element exists and hasn't been processed yet
        if (adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initialized.current = true;
        }
      } catch (e) {
        // Only log if it's not the "already filled" error which is common in React dev
        if (e instanceof Error && !e.message.includes('already have ads')) {
          console.error("AdSense error", e);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [slot]); // Re-run if slot changes

  return (
    <div className="my-8 flex justify-center w-full overflow-hidden min-h-[100px]">
      <ins 
           ref={adRef}
           className="adsbygoogle"
           style={style}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your actual Publisher ID
           data-ad-slot={slot}
           data-ad-format={format}
           data-full-width-responsive="true"></ins>
    </div>
  );
};
