import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = process.env.BASE_PATH ?? env.BASE_PATH ?? '/';
  if (!base.startsWith('/') || !base.endsWith('/'))
    throw new Error('BASE_PATH must start and end with /');
  return {
    base,
    // An explicit plugin list keeps SWC enabled for production transforms too.
    plugins: [react({ plugins: [] }), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    build: { manifest: true },
    server: { port: 5173, strictPort: true },
    preview: { port: 4173, strictPort: true },
  };
});
