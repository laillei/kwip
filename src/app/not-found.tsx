import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Trang không tồn tại
      </p>
      <Link
        href="/"
        className="mt-6 text-sm text-neutral-400 hover:text-white transition-colors"
      >
        ← Về trang chủ
      </Link>
    </main>
  );
}
