import { useEffect, useState, type PropsWithChildren } from 'react';
import { SiteContext } from '@/context/site-context';
import { useAccessibility } from '@/hooks/use-accessibility';
import type { ProjectId } from '@/types/content';

export function SiteProvider({
  children,
  initialProject,
}: PropsWithChildren<{ initialProject?: ProjectId }>) {
  const { accessible, toggleAccessible } = useAccessibility();
  const [donationOpen, setDonationOpen] = useState(false);
  const [donationTarget, setDonationTarget] = useState('fund');
  const [activeProject, setActiveProject] = useState(initialProject);

  function openDonation() {
    setDonationTarget('fund');
    setDonationOpen(true);
  }
  useEffect(() => {
    document.body.classList.toggle('accessible', accessible);
    return () => document.body.classList.remove('accessible');
  }, [accessible]);
  return (
    <SiteContext
      value={{
        accessible,
        toggleAccessible,
        donationOpen,
        setDonationOpen,
        donationTarget,
        setDonationTarget,
        activeProject,
        setActiveProject,
        openDonation,
      }}
    >
      {children}
    </SiteContext>
  );
}
