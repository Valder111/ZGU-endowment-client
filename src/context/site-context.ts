import { createContext } from 'react';
export interface SiteState {
  accessible: boolean;
  toggleAccessible: () => void;
  donationOpen: boolean;
  setDonationOpen: (open: boolean) => void;
}
export const SiteContext = createContext<SiteState | null>(null);
