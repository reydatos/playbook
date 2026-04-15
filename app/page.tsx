"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
}
