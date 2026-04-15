"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@/lib/constants";
import { Role } from "@/lib/types";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Users, Building2, Info } from "lucide-react";

// Demo users for the settings page
const demoUsers = [
  { id: "1", name: "Sarah Chen", email: "sarah@company.com", role: "admin" as Role },
  { id: "2", name: "James Rodriguez", email: "james@company.com", role: "editor" as Role },
  { id: "3", name: "Emily Watson", email: "emily@company.com", role: "editor" as Role },
  { id: "4", name: "Michael Park", email: "michael@company.com", role: "viewer" as Role },
  { id: "5", name: "Lisa Thompson", email: "lisa@company.com", role: "viewer" as Role },
];

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const [users] = useState(demoUsers);

  if (!isAdmin) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          You don&apos;t have permission to access settings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Topbar title="Settings" description="Manage team and application settings" />

      <div className="flex-1 space-y-6 p-6">
        {/* Organization Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Organization</CardTitle>
            </div>
            <CardDescription>Manage your organization details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization Name</label>
                <Input defaultValue="Acme Corporation" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan</label>
                <div className="flex h-10 items-center">
                  <Badge className="bg-blue-100 text-blue-800">Enterprise</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Team Members</CardTitle>
              </div>
              <Button size="sm">Invite Member</Button>
            </div>
            <CardDescription>
              Manage who has access to your playbooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {member.name}
                        {member.email === user?.email && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <Select defaultValue={member.role}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Descriptions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Roles & Permissions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ROLES.map((role) => (
                <div
                  key={role.value}
                  className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
                >
                  <Badge variant="outline" className="mt-0.5 capitalize">
                    {role.label}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Notice */}
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Demo Mode</p>
            <p className="text-xs text-blue-600 mt-1">
              This is a demonstration environment. User management changes are
              not persisted. In production, this would integrate with your
              SSO/SAML provider and database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
