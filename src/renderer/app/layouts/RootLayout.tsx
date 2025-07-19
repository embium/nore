import { Outlet } from "@tanstack/react-router";
import { Layout } from "../../components";
import React from "react";

type RootLayoutProps = {
  children?: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <Layout>
      {children || <Outlet />}
    </Layout>
  );
}
