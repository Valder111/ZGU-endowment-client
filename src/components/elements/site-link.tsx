import type { ComponentProps } from 'react';
import { sitePath } from '@/utils/paths';
export function SiteLink({
  href,
  ...props
}: ComponentProps<'a'> & { href: string }) {
  return <a href={href.startsWith('/') ? sitePath(href) : href} {...props} />;
}
