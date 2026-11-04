import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = process.env.BASE_PATH ?? env.BASE_PATH ?? '/';
  if (!base.startsWith('/') || !base.endsWith('/'))
    throw new Error('BASE_PATH must start and end with /');
  const staffProxy =
    process.env.STAFF_API_PROXY_TARGET ?? env.STAFF_API_PROXY_TARGET;
  const devPort = Number(process.env.DEV_PORT ?? env.DEV_PORT ?? 5173);
  if (!Number.isInteger(devPort) || devPort < 1 || devPort > 65535)
    throw new Error('DEV_PORT must be an integer from 1 to 65535');
  return {
    base,
    // An explicit plugin list keeps SWC enabled for production transforms too.
    plugins: [react({ plugins: [] }), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    build: { manifest: true },
    server: {
      port: devPort,
      strictPort: true,
      proxy: staffProxy
        ? { '/api/v1': { target: staffProxy, changeOrigin: true } }
        : undefined,
    },
    preview: { port: 4173, strictPort: true },
  };
});
