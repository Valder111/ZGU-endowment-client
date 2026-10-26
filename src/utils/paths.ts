export function normalizePath(path: string): string {
  const clean = path.replace(/\/index\.html$/, '/').replace(/\/+$/, '');
  return clean ? `${clean}/` : '/';
}
export function sitePath(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
export function localPath(path: string): string {
  const base = import.meta.env.BASE_URL;
  return normalizePath(
    base !== '/' && path.startsWith(base)
      ? `/${path.slice(base.length)}`
      : path,
  );
}
