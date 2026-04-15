"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  LayoutDashboard,
  Plus,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "New Playbook",
    href: "/playbooks/new",
    icon: Plus,
    roles: ["admin", "editor"] as const,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["admin"] as const,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && (item.roles as readonly string[]).includes(user.role);
  });

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <BookOpen className="h-4 w-4" />
        </div>
        <span className="text-lg font-bold">{APP_NAME}</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-4">
        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role}
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
