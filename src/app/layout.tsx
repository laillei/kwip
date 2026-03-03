import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kwip - Kiểm tra thành phần K-beauty",
  description: "Kiểm tra thành phần mỹ phẩm Hàn Quốc bằng tiếng Việt",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={notoSans.className}>{children}</body>
    </html>
  );
}
