import { enableReactTracking } from '@legendapp/state/config/enableReactTracking';
import { configureObservablePersistence } from '@legendapp/state/persist';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import 'virtual:uno.css';
import './styles/globals.css';
import { routeTree } from '../routeTree.gen';

import t, { queryClient, trpcClient } from '@/shared/config';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './contexts/ThemeProvider';

import { initializeServers } from '@/features/mcp-servers/state';

enableReactTracking({
  auto: true,
});

configureObservablePersistence({
  pluginLocal: ObservablePersistLocalStorage,
});

const history = createHashHistory({});
const router = createRouter({ routeTree, history });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

if (!rootElement?.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  initializeServers();

  root.render(
    <StrictMode>
      <t.Provider
        client={trpcClient}
        queryClient={queryClient}
      >
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Toaster
              richColors
              position="top-right"
              offset={50}
            />
          </QueryClientProvider>
        </ThemeProvider>
      </t.Provider>
    </StrictMode>
  );
}
