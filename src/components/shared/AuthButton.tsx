"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

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
      <Link href={`/${locale}/me`} className="flex items-center gap-2">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "Profile"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-medium text-neutral-600">
            {session.user.name?.[0] ?? "U"}
          </div>
        )}
      </Link>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
    >
      Sign in
    </button>
  );
}
