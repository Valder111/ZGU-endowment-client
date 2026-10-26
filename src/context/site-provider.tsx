import { useEffect, useState, type PropsWithChildren } from 'react';
import { SiteContext } from '@/context/site-context';
import { useAccessibility } from '@/hooks/use-accessibility';
export function SiteProvider({ children }: PropsWithChildren) {
  const { accessible, toggleAccessible } = useAccessibility();
  const [donationOpen, setDonationOpen] = useState(false);
  useEffect(() => {
    document.body.classList.toggle('accessible', accessible);
    return () => document.body.classList.remove('accessible');
  }, [accessible]);
  return (
    <SiteContext
      value={{ accessible, toggleAccessible, donationOpen, setDonationOpen }}
    >
      {children}
    </SiteContext>
  );
}
