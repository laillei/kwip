"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-lg font-semibold text-neutral-900">Đã xảy ra lỗi</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-neutral-900 text-white text-[15px] font-medium rounded-full"
      >
        Thử lại
      </button>
    </div>
  );
}
