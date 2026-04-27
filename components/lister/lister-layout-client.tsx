"use client";

import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { cn } from "@/lib/utils";

export function ListerLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useSidebarStore();

  return (
    <div
      className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
        isOpen ? "md:ml-64" : "md:ml-16",
      )}
    >
      {children}
    </div>
  );
}
