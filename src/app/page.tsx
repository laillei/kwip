import Link from "next/link";
import concerns from "@/data/concerns.json";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold tracking-tight">Kwip</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Kiểm tra thành phần K-beauty bằng tiếng Việt
      </p>

      <div className="mt-10 grid grid-cols-2 gap-3 w-full max-w-sm">
        {concerns.map((concern) => (
          <Link
            key={concern.id}
            href={`/products?concern=${concern.id}`}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 p-6 min-h-[120px] transition-colors hover:bg-neutral-800 active:bg-neutral-700"
          >
            <span className="text-2xl">{concern.icon}</span>
            <span className="text-sm font-medium">{concern.label.vi}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
