import { useContext } from 'react';
import { SiteContext } from '@/context/site-context';
export function useSite() {
  const state = useContext(SiteContext);
  if (!state) throw new Error('useSite must be used within SiteProvider');
  return state;
}
