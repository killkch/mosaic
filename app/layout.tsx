import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "모자이크",
  description: "모자이크 짤 생성 앱",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (

    <body className="min-h-full flex flex-col">{children}</body>

  );
}
