import type { Metadata } from "next";
import { Noto_Sans_KR, Dongle } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

// 🔤 1. 베이스 폰트: Google Noto Sans Korean
const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

// 🎨 2. 특별 타이틀 폰트: Google Dongle
const dongle = Dongle({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-dongle",
  display: "swap",
});

// 웹사이트 메타데이터 설정 (SEO 및 브라우저 탭 타이틀)
export const metadata: Metadata = {
  title: "Mosaic AI - 원클릭 바이럴 숏폼 영상 제작 AI",
  description: "아이디어 한 줄로 60초 만에 완성하는 틱톡, 릴스, 유튜브 쇼츠 바이럴 영상 제작 서비스",
};

/**
 * Next.js 루트 레이아웃 (RootLayout)
 * 
 * ⚠️ Next.js App Router 규칙:
 * app/layout.tsx는 모든 페이지의 최상위 껍질이므로 반드시 <html>과 <body> 태그를 포함해야 합니다.
 * Noto Sans KR을 기본 폰트로 적용하고, Dongle 폰트 변수를 제공합니다.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`dark ${notoSansKr.variable} ${dongle.variable}`}
    >
      <body className={`${notoSansKr.className} min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
