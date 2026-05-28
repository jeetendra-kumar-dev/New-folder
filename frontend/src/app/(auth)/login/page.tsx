"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest, jsonBody } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthSession, OtpRequestResult } from "@/types/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [otpResult, setOtpResult] = useState<OtpRequestResult | null>(null);

  const requestOtpMutation = useMutation({
    mutationFn: () =>
      apiRequest<OtpRequestResult>("/auth/otp/request", {
        method: "POST",
        auth: false,
        body: jsonBody({ email }),
      }),
    onSuccess: (result) => {
      setOtpResult(result);
      setCode(result.debugCode ?? "");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: () =>
      apiRequest<AuthSession>("/auth/otp/verify", {
        method: "POST",
        auth: false,
        body: jsonBody({ email, code, name: name || undefined }),
      }),
    onSuccess: (session) => {
      setSession(session);
      router.push(redirectTo);
      router.refresh();
    },
  });

  const isCodeStep = Boolean(otpResult);
  const error = requestOtpMutation.error?.message ?? verifyOtpMutation.error?.message;

  return (
    <main className="grid min-h-screen bg-muted lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden border-r bg-background px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </span>
          PocketPilot AI
        </div>
        <div className="max-w-md">
          <p className="text-sm font-medium text-muted-foreground">Private by design</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal">Your money, goals, and memory in one calm cockpit.</h1>
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground">Secure email login</p>
            <h2 className="mt-2 text-2xl font-semibold">{isCodeStep ? "Enter your code" : "Welcome to PocketPilot"}</h2>
          </div>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (isCodeStep) {
                verifyOtpMutation.mutate();
              } else {
                requestOtpMutation.mutate();
              }
            }}
          >
            <label className="space-y-2">
              <span className="text-sm font-medium">Email</span>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                disabled={isCodeStep || requestOtpMutation.isPending || verifyOtpMutation.isPending}
                required
              />
            </label>
            {isCodeStep ? (
              <>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Name</span>
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Optional" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">6-digit code</span>
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    required
                  />
                </label>
                {otpResult?.debugCode ? (
                  <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                    Local code: <span className="font-semibold">{otpResult.debugCode}</span>
                  </div>
                ) : null}
              </>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" size="lg" disabled={requestOtpMutation.isPending || verifyOtpMutation.isPending}>
              {isCodeStep ? <KeyRound className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              {isCodeStep ? "Verify and continue" : "Send login code"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          {isCodeStep ? (
            <Button
              variant="ghost"
              className="mt-3 w-full"
              onClick={() => {
                setOtpResult(null);
                setCode("");
              }}
            >
              Use another email
            </Button>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
