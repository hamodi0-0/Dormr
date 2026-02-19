"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSidebarStore } from "@/lib/stores/sidebar-store";

interface DashboardHeaderProps {
  title?: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const toggle = useSidebarStore((state) => state.toggle);

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex items-center px-4 gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="h-5 w-5" />
      </Button>

      {title && (
        <h1 className="text-base font-semibold text-foreground truncate">
          {title}
        </h1>
      )}

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
