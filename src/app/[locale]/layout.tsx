import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import AuthProvider from "@/components/providers/AuthProvider";

const notoSans = Noto_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) return {};
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.site.title,
    description: dict.site.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  return (
    <html lang={locale}>
      <body
        className={`${notoSans.className} bg-neutral-50 text-neutral-900 min-h-screen antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
