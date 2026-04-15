"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Role } from "@/lib/types";
import { ROLES, APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Shield, Pencil, Eye } from "lucide-react";

const roleIcons: Record<Role, React.ReactNode> = {
  admin: <Shield className="h-5 w-5" />,
  editor: <Pencil className="h-5 w-5" />,
  viewer: <Eye className="h-5 w-5" />,
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("editor");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    login(name.trim(), email.trim(), selectedRole);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white">
            <BookOpen className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{APP_NAME}</h1>
          <p className="mt-2 text-muted-foreground">
            Enterprise technical playbook management
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your details and select a role to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center transition-colors ${
                        selectedRole === role.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {roleIcons[role.value]}
                      <span className="text-xs font-medium">{role.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {ROLES.find((r) => r.value === selectedRole)?.description}
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Continue to Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
