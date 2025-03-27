"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useEffect, useState } from "react";

export type SidebarContextType = {
  isOpen: boolean;
  toggle: () => void;
};
export const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined
);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-state");
    if (savedState) {
      setIsOpen(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-state", JSON.stringify(isOpen));
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarContext.Provider value={{ isOpen, toggle }}>
        {children}
      </SidebarContext.Provider>
    </QueryClientProvider>
  );
}
