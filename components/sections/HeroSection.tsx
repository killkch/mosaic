"use client";

import React from "react";
import { PrismaHero } from "@/components/ui/prisma-hero";

/**
 * 🎬 랜딩 페이지 HeroSection 컴포넌트
 * 현재 배경색(#09090b)을 유지한 채 PrismaHero 컴포넌트를 rounded 형태로 감싸서 렌더링합니다.
 */
export default function HeroSection() {
  return (
    <section className="w-full bg-[#09090b] px-3 sm:px-5 md:px-8 pt-3 sm:pt-5 pb-6 sm:pb-10 flex justify-center">
      <div className="w-full max-w-[1720px] h-[85vh] sm:h-[88vh] md:h-[90vh] min-h-[580px] max-h-[960px]">
        <PrismaHero />
      </div>
    </section>
  );
}
