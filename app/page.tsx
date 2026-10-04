"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import HeroSection from "@/components/sections/HeroSection";
import StoryScrollSection from "@/components/sections/StoryScrollSection";
import FooterSection from "@/components/sections/FooterSection";

export default function Home() {
  // Firebase 인증 상태 및 사용자 데이터 훅
  const { user, userData, logout } = useAuth();
  // 로그인/회원가입 모달 열림 여부 상태
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased selection:bg-white selection:text-black">
      {/* =================================================================
          1. 상단 미니멀 네비게이션 헤더
          ================================================================= */}
      <header className="sticky top-0 z-40 bg-[#09090b]/85 backdrop-blur-md border-b border-[#27272a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* 브랜드 로고 */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black font-black text-sm tracking-wider group-hover:scale-105 transition-transform">
              M
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-lg">MOSAIC</span>
              <span className="text-[11px] font-mono text-[#a1a1aa] px-2 py-0.5 rounded-full bg-[#18181b] border border-[#27272a]">
                AI Studio
              </span>
            </div>
          </Link>

          {/* 메뉴 링크 (데스크톱) */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#a1a1aa]">
            <a href="#story-scroll" className="hover:text-white transition-colors">
              스토리
            </a>
            <a href="#story-scroll" className="hover:text-white transition-colors">
              4가지 프리셋
            </a>
            <a href="#story-scroll" className="hover:text-white transition-colors">
              제작 파이프라인
            </a>
          </nav>

          {/* 우측 유저 액션 버튼 (크레딧/로그인/스튜디오 이동) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {userData && (
                  <span className="text-xs font-mono text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 hidden sm:inline-flex items-center gap-1">
                    ✨ {userData.credits} 크레딧
                  </span>
                )}
                <span className="text-xs font-mono text-[#a1a1aa] px-2.5 py-1 rounded-full bg-[#18181b] border border-[#27272a] max-w-[140px] sm:max-w-[180px] truncate">
                  👤 {user.email}
                </span>
                <button
                  onClick={() => logout()}
                  className="text-xs text-[#71717a] hover:text-[#ff5a5a] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs sm:text-sm text-[#a1a1aa] hover:text-white px-3 py-2 transition-colors cursor-pointer"
              >
                로그인
              </button>
            )}

            {user ? (
              <Link
                href="/generate"
                className="text-xs sm:text-sm font-medium bg-white text-black hover:bg-[#e4e4e7] px-4 py-2 rounded-full transition-all active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>스튜디오 열기</span>
                <span className="text-xs">🎬</span>
              </Link>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs sm:text-sm font-medium bg-white text-black hover:bg-[#e4e4e7] px-4 py-2 rounded-full transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                무료 시작하기
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =================================================================
          2. 최상단 Hero Section (시네마틱 배경 + 헤드라인)
          ================================================================= */}
      <HeroSection />

      {/* =================================================================
          3. Hero Section 바로 아래: Story Scroll Section
             GSAP ScrollTrigger 기반 3D 카드 틸트 & 핀 인터랙션 섹션
             - 01: CREATE WITHOUT LIMITS (브랜드 아이덴티티)
             - 02: FOUR KILLER ANGLES (4대 시그니처 앵글 프리셋 & 실시간 동영상)
             - 03: UPLOAD. CHOOSE. GENERATE. (3단계 제작 파이프라인)
             - 04: THE NEW STANDARD OF SHORT (2K 울트라, 9:16 모바일 규격)
             - 05: READY TO CREATE? (스튜디오 CTA 이동)
          ================================================================= */}
      <div id="story-scroll">
        <StoryScrollSection />
      </div>

      {/* =================================================================
          4. 시네마틱 미니멀 푸터 (초대형 MOSAIC 볼드 로고 & 필수 링크)
          ================================================================= */}
      <FooterSection />

      {/* =================================================================
          5. Firebase 로그인/회원가입 모달
          ================================================================= */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
