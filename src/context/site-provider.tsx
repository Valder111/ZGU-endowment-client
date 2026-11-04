import { useEffect, useState, type PropsWithChildren } from 'react';
import { SiteContext } from '@/context/site-context';
import { useAccessibility } from '@/hooks/use-accessibility';
import { generalCapital, projects } from '@/constants/projects';
import type { ProjectId } from '@/types/content';

export function SiteProvider({
  children,
  initialProject,
}: PropsWithChildren<{ initialProject?: ProjectId }>) {
  const { accessible, toggleAccessible } = useAccessibility();
  const [donationOpen, setDonationOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(initialProject);
  const [donationDirection, setDonationDirection] = useState(generalCapital);

  function openDonation() {
    setDonationDirection(
      projects.find(({ id }) => id === activeProject)?.title ?? generalCapital,
    );
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
        activeProject,
        setActiveProject,
        donationDirection,
        setDonationDirection,
        openDonation,
      }}
    >
      {children}
    </SiteContext>
  );
}
