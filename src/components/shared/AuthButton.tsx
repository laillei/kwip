import Link from "next/link";

interface AuthButtonProps {
  locale: string;
}

export default function AuthButton({ locale }: AuthButtonProps) {
  return (
    <Link
      href={`/${locale}/me`}
      className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center hover:bg-neutral-300 transition-colors"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-neutral-600"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    </Link>
  );
}
