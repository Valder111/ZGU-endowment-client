import { pages } from '@/routes/registry';
import { normalizePath } from '@/utils/paths';
import type { PageDefinition } from '@/types/content';
const byPath = new Map<string, PageDefinition>(
  pages.map((page) => [page.path, page]),
);
export function resolvePage(pathname: string): PageDefinition | undefined {
  return byPath.get(normalizePath(pathname));
}
