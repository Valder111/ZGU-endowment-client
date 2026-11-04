import { createContext } from 'react';
import type { ProjectId } from '@/types/content';
export interface SiteState {
  accessible: boolean;
  toggleAccessible: () => void;
  donationOpen: boolean;
  setDonationOpen: (open: boolean) => void;
  activeProject: ProjectId | undefined;
  setActiveProject: (id: ProjectId) => void;
  donationDirection: string;
  setDonationDirection: (value: string) => void;
  openDonation: () => void;
}
export const SiteContext = createContext<SiteState | null>(null);
