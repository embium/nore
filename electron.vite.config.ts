import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'node:path';
import UnoCSS from 'unocss/vite';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: 'src/main/index.ts',
      },
    },
    resolve: {
      alias: {
        '@/src': resolve(__dirname, 'src/'),
        '@/shared': resolve(__dirname, 'src/shared/'),
        '@/components': resolve(__dirname, 'src/renderer/components/'),
        '@/assets': resolve(__dirname, 'src/assets/'),
        '@/pages': resolve(__dirname, 'src/renderer/routes/'),
        '@/app': resolve(__dirname, 'src/renderer/app/'),
        '@/styles': resolve(__dirname, 'src/renderer/styles/'),
        '@/hooks': resolve(__dirname, 'src/renderer/hooks/'),
        '@/utils': resolve(__dirname, 'src/renderer/utils/'),
        '@/lib': resolve(__dirname, 'src/renderer/lib/'),
        '@/features': resolve(__dirname, 'src/renderer/features/'),
        '@/main': resolve(__dirname, 'src/main/'),
        '@/preload': resolve(__dirname, 'src/preload/'),
        '@/types': resolve(__dirname, 'src/types/'),
        '@nore/mcp-manager-win32-x64-msvc': resolve(
          __dirname,
          'src/rust/mcp-manager/mcp-manager.win32-x64-msvc.node'
        ),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: 'src/preload/index.ts',
      },
    },
    resolve: {
      alias: {
        '@/src': resolve(__dirname, 'src/'),
        '@/shared': resolve(__dirname, 'src/shared/'),
        '@/preload': resolve(__dirname, 'src/preload/'),
        '@nore/mcp-manager-win32-x64-msvc': resolve(
          __dirname,
          'src/rust/mcp-manager/mcp-manager.win32-x64-msvc.node'
        ),
      },
    },
  },
  renderer: {
    root: 'src/renderer/',
    resolve: {
      alias: {
        '@/src': resolve(__dirname, 'src/'),
        '@/shared': resolve(__dirname, 'src/shared/'),
        '@/components': resolve(__dirname, 'src/renderer/components/'),
        '@/assets': resolve(__dirname, 'src/assets/'),
        '@/pages': resolve(__dirname, 'src/renderer/routes/'),
        '@/app': resolve(__dirname, 'src/renderer/app/'),
        '@/styles': resolve(__dirname, 'src/renderer/styles/'),
        '@/hooks': resolve(__dirname, 'src/renderer/hooks/'),
        '@/utils': resolve(__dirname, 'src/renderer/utils/'),
        '@/lib': resolve(__dirname, 'src/renderer/lib/'),
        '@/features': resolve(__dirname, 'src/renderer/features/'),
        '@/main': resolve(__dirname, 'src/main/'),
        '@/preload': resolve(__dirname, 'src/preload/'),
        '@/types': resolve(__dirname, 'src/types/'),
        '@nore/mcp-manager-win32-x64-msvc': resolve(
          __dirname,
          'src/rust/mcp-manager/mcp-manager.win32-x64-msvc.node'
        ),
      },
    },
    plugins: [
      react(),
      UnoCSS(),
      TanStackRouterVite({
        routesDirectory: './src/renderer/routes/',
        generatedRouteTree: './src/renderer/routeTree.gen.ts',
      }),
    ],
    // where to output your web files
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          splash: resolve(__dirname, 'src/renderer/splash.html'),
        },
      },
    },
  },
});
