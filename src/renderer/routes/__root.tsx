import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Layout } from '@/app/layouts/layout';

export const Route = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </Layout>
  ),
});
