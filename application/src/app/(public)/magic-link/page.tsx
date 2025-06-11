"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function MagicLinkVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    if (!token || !email) {
      setStatus('error');
      setError('Missing token or email in the URL.');
      return;
    }

    const verifyMagicLink = async () => {
      try {
        await signIn("credentials", { email, magicLinkToken: token, redirect: false });
        setStatus('success');
        router.replace("/");
      } catch (err) {
        setStatus('error');
        setError('Failed to verify magic link.');
      }
    };

    verifyMagicLink();

  }, [router, searchParams]);

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 32 }}>
      {status === 'verifying' && <div>Verifying magic link...</div>}
      {status === 'success' && <div>Login successful! Redirecting...</div>}
      {status === 'error' && <div style={{ color: 'red' }}>Error: {error}</div>}
    </div>
  );
}
