"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

interface AuthButtonProps {
  locale: string;
}

export default function AuthButton({ locale }: AuthButtonProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse" />;
  }

  if (session?.user) {
    return (
      <Link
        href={`/${locale}/me`}
        className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center hover:bg-neutral-300 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </Link>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="text-sm font-semibold bg-neutral-900 text-white rounded-full px-4 py-1.5 hover:bg-neutral-700 transition-colors"
    >
      Sign in
    </button>
  );
}
