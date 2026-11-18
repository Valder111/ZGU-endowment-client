import { createContext } from 'react';
import type { ProjectId } from '@/types/content';
export interface SiteState {
  accessible: boolean;
  toggleAccessible: () => void;
  donationOpen: boolean;
  setDonationOpen: (open: boolean) => void;
  donationTarget: string;
  setDonationTarget: (value: string) => void;
  activeProject: ProjectId | undefined;
  setActiveProject: (id: ProjectId) => void;
  openDonation: () => void;
}
export const SiteContext = createContext<SiteState | null>(null);
