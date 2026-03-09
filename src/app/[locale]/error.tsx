"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-white text-black rounded"
      >
        Thử lại
      </button>
    </div>
  );
}
