"use client";

import { useQuery } from "@tanstack/react-query";
import { Mail, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import type { User } from "@/types/api";

export default function SettingsPage() {
  const userQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => apiRequest<User>("/auth/me"),
  });

  const user = userQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Account and security details for the current workspace." />
      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Name</span>
            <Input value={user?.name ?? ""} readOnly placeholder="Not set" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Email</span>
            <Input value={user?.email ?? ""} readOnly placeholder="Loading" />
          </label>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="success">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            OTP enabled
          </Badge>
          <Badge variant="outline">
            <Mail className="mr-1 h-3.5 w-3.5" />
            Email verified
          </Badge>
        </div>
      </div>
    </div>
  );
}
