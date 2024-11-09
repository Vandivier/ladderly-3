"use client";

import { ThemeProvider } from "../theme/ThemeContext";
import { TRPCReactProvider } from "~/trpc/react";

export function ProviderProvider({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </TRPCReactProvider>
  );
}
