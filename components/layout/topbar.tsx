"use client";

import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Topbar({ title, description, children }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {user && (
          <Badge variant="secondary" className="capitalize">
            {user.role}
          </Badge>
        )}
      </div>
    </header>
  );
}
