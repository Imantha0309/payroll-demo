import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'url';

import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const resolvePath = (str) => path.resolve(__dirname, str);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = `${env.VITE_APP_BASE_NAME}`;
  const PORT = 3000;

  return {
    server: {
      // this ensures that the browser opens upon server start
      open: true,
      // this sets a default port to 3000
      port: PORT,
      host: true,
      hmr: {
        host: 'localhost'
      }
    },
    preview: {
      open: true,
      host: true
    },
    define: {
      global: 'window'
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, 'src')
        },
        {
          find: 'store',
          replacement: path.resolve(__dirname, 'src/store')
        },
        {
          find: 'config',
          replacement: path.resolve(__dirname, 'src/config')
        },
        {
          find: 'contexts',
          replacement: path.resolve(__dirname, 'src/contexts')
        },
        {
          find: 'assets',
          replacement: path.resolve(__dirname, 'src/assets')
        },
        {
          find: 'components',
          replacement: path.resolve(__dirname, 'src/components')
        },
        {
          find: 'layouts',
          replacement: path.resolve(__dirname, 'src/layouts')
        },
        {
          find: 'views',
          replacement: path.resolve(__dirname, 'src/views')
        },
        {
          find: 'hooks',
          replacement: path.resolve(__dirname, 'src/hooks')
        },
        {
          find: 'utils',
          replacement: path.resolve(__dirname, 'src/utils')
        },
        {
          find: 'data',
          replacement: path.resolve(__dirname, 'src/data')
        },
        {
          find: 'routes',
          replacement: path.resolve(__dirname, 'src/routes')
        }
      ]
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false
        },
        less: {
          charset: false
        }
      },
      charset: false,
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    },
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        input: {
          main: resolvePath('index.html'),
          legacy: resolvePath('index.html')
        }
      }
    },
    base: API_URL,
    plugins: [react(), tsconfigPaths()]
  };
});                