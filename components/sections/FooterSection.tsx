'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowUp } from 'lucide-react';

/**
 * 🏛️ MOSAIC 시네마틱 푸터 컴포넌트 (FooterSection)
 * - 꼭 필요한 필수 정보만 정갈하게 배치
 * - 최하단 화면 전체를 압도하는 초대형 볼드 MOSAIC 로고 타이포그래피
 * - 최상단 스크롤 이동(Back to top) 및 필수 법적 고지/링크 포함
 */
export default function FooterSection() {
  // 페이지 최상단으로 부드럽게 스크롤 이동하는 함수
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#09090b] text-[#f4f4f5] border-t border-[#27272a] overflow-hidden pt-20 pb-10">
      {/* 배경 은은한 방사형 글로우 효과 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* =================================================================
            1. 상단: 브랜드 요약 & 필수 네비게이션 링크
            ================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-[#27272a]/80">
          {/* 좌측: 브랜드 아이덴티티 및 상태 */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-black font-black text-base tracking-wider shadow-sm">
                M
              </div>
              <span className="font-bold text-xl text-white tracking-tight">MOSAIC</span>
              <span className="text-[11px] font-mono text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Studio Engine v2.0
              </span>
            </div>

            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              복잡한 프롬프트 없이 단 한 장의 사진으로 만드는 초고화질 2K 시네마틱 숏폼 비디오 생성 엔진.
            </p>

            {/* 시스템 가동 상태 */}
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational · Google Nano Banana Pro 2K</span>
            </div>
          </div>

          {/* 우측: 필수 링크 2열 */}
          <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            {/* 메뉴 열 1 */}
            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">Product</p>
              <ul className="space-y-2.5 text-zinc-400">
                <li>
                  <Link href="/generate" className="hover:text-white transition-colors flex items-center gap-1 group">
                    <span>AI 스튜디오</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <a href="#story-scroll" className="hover:text-white transition-colors">
                    4대 시네마틱 프리셋
                  </a>
                </li>
                <li>
                  <Link href="/generate" className="hover:text-white transition-colors">
                    토스 크레딧 충전
                  </Link>
                </li>
              </ul>
            </div>

            {/* 메뉴 열 2 */}
            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">Legal & Policy</p>
              <ul className="space-y-2.5 text-zinc-400 text-xs">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    이용약관
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    개인정보처리방침
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    결제 및 환불 규정
                  </a>
                </li>
              </ul>
            </div>

            {/* 메뉴 열 3 */}
            <div className="col-span-2 sm:col-span-1 space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">Back To Top</p>
              <button
                onClick={scrollToTop}
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#141416] border border-[#27272a] text-xs font-mono text-zinc-400 hover:text-white hover:border-zinc-500 transition-all cursor-pointer group active:scale-95"
              >
                <span>맨 위로 가기</span>
                <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* =================================================================
            2. 중앙-하단: 화면을 압도하는 초대형 MOSAIC 로고
            ================================================================= */}
        <div className="pt-12 pb-6 text-center select-none overflow-hidden">
          <h1 className="text-[17vw] sm:text-[18vw] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-zinc-200 via-zinc-600/40 to-zinc-900/10 pointer-events-none drop-shadow-sm">
            MOSAIC
          </h1>
        </div>

        {/* =================================================================
            3. 최하단: 한 줄 카피라이트 및 메타 정보
            ================================================================= */}
        <div className="pt-6 border-t border-[#27272a]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-400">
          <p>© 2026 MOSAIC AI Studio. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">Powered by Replicate & Toss Payments</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="text-zinc-300 font-sans">Crafted for Creators</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
