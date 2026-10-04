'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Video, Camera, Flame } from 'lucide-react';
import FlowArt, { FlowSection } from '@/components/ui/story-scroll';

/**
 * 📜 MOSAIC 맞춤형 StoryScrollSection 컴포넌트
 * - 왼쪽 상단 넘버링 및 오른쪽 상단 텍스트 제거
 * - 감성적이고 개성 있는 Google Dongle 폰트(font-dongle) 적용
 * - public 폴더의 4개 실시간 비디오(/sample1.mp4 ~ /sample4.mp4)를 4대 프리셋 카드에 배치
 */
export default function StoryScrollSection() {
  return (
    <FlowArt aria-label="MOSAIC AI 서비스 소개 및 쇼케이스">
      {/* =================================================================
          슬라이드 01: 브랜드 정체성 (Who We Are)
          - 상단 넘버링/보조 텍스트 제거
          - Dongle 폰트로 감각적인 타이틀 표현
          ================================================================= */}
      <FlowSection
        aria-label="서비스 소개"
        style={{ backgroundColor: '#fd5200', color: '#ffffff' }}
      >
        <div className="pt-2">
          {/* Dongle 폰트 감성 서브타이틀 */}
          <p className="font-dongle text-4xl sm:text-5xl md:text-6xl tracking-wide leading-none opacity-90 mb-2">
            단 한 장의 사진으로 터지는 시네마틱 숏폼
          </p>
          <h2 className="text-[clamp(3.2rem,11vw,12rem)] font-black leading-[0.88] uppercase tracking-tighter">
            CREATE
            <br />
            WITHOUT
            <br />
            LIMITS
          </h2>
        </div>

        <hr className="my-[2vw] border-none border-t border-black/20" />

        <div className="mt-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <p className="max-w-[48ch] text-[clamp(1rem,2vw,1.6rem)] font-medium leading-relaxed opacity-95">
            복잡한 촬영 장비나 전문 영상 편집 기술이 없어도 괜찮습니다. 당신의 일상 사진 한 장이 100만 뷰 바이럴 알고리즘을 관통하는 고화질 시네마틱 영상으로 탄생합니다.
          </p>
          <span className="text-xs font-mono tracking-widest uppercase opacity-75">
            SCROLL TO EXPLORE ↓
          </span>
        </div>
      </FlowSection>

      {/* =================================================================
          슬라이드 02: 4대 시네마틱 프리셋 (The 4 Presets)
          - 상단 넘버링/보조 텍스트 제거
          - public 폴더의 sample1.mp4, sample2.mp4, sample3.mp4, sample4.mp4 비디오 쇼케이스 배치
          - Dongle 폰트로 프리셋 타이틀 강조
          ================================================================= */}
      <FlowSection
        aria-label="4대 시네마틱 앵글 프리셋"
        style={{ backgroundColor: '#09090b', color: '#ffffff' }}
      >
        <div className="pt-2">
          <p className="font-dongle text-4xl sm:text-5xl md:text-6xl text-emerald-400 leading-none mb-2">
            알고리즘을 사로잡는 4가지 시그니처 앵글
          </p>
          <h2 className="text-[clamp(2.8rem,9vw,9.5rem)] font-black leading-[0.9] uppercase tracking-tighter text-[#E1E0CC]">
            FOUR
            <br />
            KILLER
            <br />
            ANGLES
          </h2>
        </div>

        <hr className="my-[1.5vw] border-none border-t border-white/15" />

        {/* 4대 프리셋 실시간 비디오 그리드 쇼케이스 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-2">
          {/* 프리셋 1: 야구 중계샷 (sample1.mp4) */}
          <div className="group rounded-2xl bg-[#141416] border border-[#27272a] hover:border-emerald-500/60 transition-all p-3 flex flex-col justify-between overflow-hidden shadow-xl">
            {/* 비디오 뷰어 */}
            <div className="relative w-full aspect-[9/13] rounded-xl overflow-hidden bg-black mb-3 border border-white/5">
              <video
                src="/sample1.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3" />
                <span>야구 중계석</span>
              </div>
            </div>
            {/* 텍스트 설명 및 Dongle 폰트 타이틀 */}
            <div>
              <h3 className="font-dongle text-3xl sm:text-4xl text-white font-bold leading-none">
                역전 홈런 타석 직캠
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                9회말 2아웃 만루, 스타디움 조명 아래 타자의 숨결까지 담아내는 초밀착 앵글
              </p>
            </div>
          </div>

          {/* 프리셋 2: 아이돌 직캠 (sample2.mp4) */}
          <div className="group rounded-2xl bg-[#141416] border border-[#27272a] hover:border-pink-500/60 transition-all p-3 flex flex-col justify-between overflow-hidden shadow-xl">
            {/* 비디오 뷰어 */}
            <div className="relative w-full aspect-[9/13] rounded-xl overflow-hidden bg-black mb-3 border border-white/5">
              <video
                src="/sample2.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-pink-400 text-[10px] font-mono border border-pink-500/30 flex items-center gap-1">
                <Camera className="w-3 h-3" />
                <span>아이돌 직캠</span>
              </div>
            </div>
            {/* 텍스트 설명 및 Dongle 폰트 타이틀 */}
            <div>
              <h3 className="font-dongle text-3xl sm:text-4xl text-white font-bold leading-none">
                4K 초근접 페이스캠
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                음악방송 킬링 파트 단독 포커스와 화려한 무대 조명을 살린 슬로우 모션
              </p>
            </div>
          </div>

          {/* 프리셋 3: 쇼미 관객석 (sample3.mp4) */}
          <div className="group rounded-2xl bg-[#141416] border border-[#27272a] hover:border-amber-500/60 transition-all p-3 flex flex-col justify-between overflow-hidden shadow-xl">
            {/* 비디오 뷰어 */}
            <div className="relative w-full aspect-[9/13] rounded-xl overflow-hidden bg-black mb-3 border border-white/5">
              <video
                src="/sample3.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-amber-400 text-[10px] font-mono border border-amber-500/30 flex items-center gap-1">
                <Video className="w-3 h-3" />
                <span>쇼미 무대</span>
              </div>
            </div>
            {/* 텍스트 설명 및 Dongle 폰트 타이틀 */}
            <div>
              <h3 className="font-dongle text-3xl sm:text-4xl text-white font-bold leading-none">
                힙합 페스티벌 관객석
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                스모그와 레이저를 뚫고 터져 나오는 808 베이스와 떼창 구역의 생생한 바이브
              </p>
            </div>
          </div>

          {/* 프리셋 4: 스트릿 패션 (sample4.mp4) */}
          <div className="group rounded-2xl bg-[#141416] border border-[#27272a] hover:border-indigo-500/60 transition-all p-3 flex flex-col justify-between overflow-hidden shadow-xl">
            {/* 비디오 뷰어 */}
            <div className="relative w-full aspect-[9/13] rounded-xl overflow-hidden bg-black mb-3 border border-white/5">
              <video
                src="/sample4.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-indigo-400 text-[10px] font-mono border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>스트릿 OOTD</span>
              </div>
            </div>
            {/* 텍스트 설명 및 Dongle 폰트 타이틀 */}
            <div>
              <h3 className="font-dongle text-3xl sm:text-4xl text-white font-bold leading-none">
                성수 런웨이 워킹
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                도심 스트릿을 런웨이로 바꾸는 트렌디한 패션 필름 스타일의 워킹 스냅샷
              </p>
            </div>
          </div>
        </div>

        <hr className="my-[1.5vw] border-none border-t border-white/15" />

        <p className="mt-auto ml-auto max-w-[45ch] text-right text-xs sm:text-sm font-mono text-zinc-400">
          모든 프리셋은 Google Nano Banana Pro AI 비전 모델을 통해 2K 최고 해상도로 렌더링됩니다.
        </p>
      </FlowSection>

      {/* =================================================================
          슬라이드 03: 3단계 워크플로우 (How It Works)
          - 상단 넘버링/보조 텍스트 제거
          - Dongle 폰트로 부드럽고 직관적인 과정 안내
          ================================================================= */}
      <FlowSection
        aria-label="이용 방법"
        style={{ backgroundColor: '#F5F0E8', color: '#121214' }}
      >
        <div className="pt-2">
          <p className="font-dongle text-4xl sm:text-5xl md:text-6xl text-zinc-700 leading-none mb-2">
            어떤 프롬프트도 필요 없는 3초 파이프라인
          </p>
          <h2 className="text-[clamp(2.8rem,9vw,9.5rem)] font-black leading-[0.9] uppercase tracking-tighter">
            UPLOAD.
            <br />
            CHOOSE.
            <br />
            GENERATE.
          </h2>
        </div>

        <hr className="my-[1.5vw] border-none border-t border-black/20" />

        {/* 3단계 상세 스텝 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-2">
          <div className="p-6 rounded-2xl bg-black/5 border border-black/10">
            <span className="text-xs font-mono font-bold text-black/50">STEP 01</span>
            <h3 className="font-dongle text-3xl sm:text-4xl text-black font-bold leading-none mt-1">
              인물 사진 1장 업로드
            </h3>
            <p className="text-xs text-black/75 mt-2 leading-relaxed">
              정면 셀카, 전신 샷, 일상 스냅까지 모든 스마트폰 사진을 완벽하게 인식하고 분석합니다.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-black/5 border border-black/10">
            <span className="text-xs font-mono font-bold text-black/50">STEP 02</span>
            <h3 className="font-dongle text-3xl sm:text-4xl text-black font-bold leading-none mt-1">
              시네마틱 앵글 프리셋 클릭
            </h3>
            <p className="text-xs text-black/75 mt-2 leading-relaxed">
              야구 중계석, 아이돌 직캠, 힙합 무대, 스트릿 OOTD 중 바이럴시키고 싶은 콘셉트를 터치합니다.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-black/5 border border-black/10">
            <span className="text-xs font-mono font-bold text-black/50">STEP 03</span>
            <h3 className="font-dongle text-3xl sm:text-4xl text-black font-bold leading-none mt-1">
              2K 고화질 즉시 완성
            </h3>
            <p className="text-xs text-black/75 mt-2 leading-relaxed">
              30초 안에 무손실 9:16 풀스크린 비디오가 생성되며 영구 보관함에 안전하게 저장됩니다.
            </p>
          </div>
        </div>

        <hr className="my-[1.5vw] border-none border-t border-black/20" />

        <p className="mt-auto max-w-[50ch] text-[clamp(1rem,1.8vw,1.4rem)] font-normal leading-relaxed opacity-85">
          인공지능 프롬프트를 공부할 필요가 없습니다. MOSAIC이 가장 완벽한 구도와 조명 값을 자동으로 매칭합니다.
        </p>
      </FlowSection>

      {/* =================================================================
          슬라이드 04: 비전 및 스펙 (The Vision)
          - 상단 넘버링/보조 텍스트 제거
          - Dongle 폰트로 기술적 차별성 부각
          ================================================================= */}
      <FlowSection
        aria-label="비전 및 성능"
        style={{ backgroundColor: '#1A3DE8', color: '#ffffff' }}
      >
        <div className="pt-2">
          <p className="font-dongle text-4xl sm:text-5xl md:text-6xl text-blue-200 leading-none mb-2">
            크리에이터를 위한 가장 진보된 숏폼 엔진
          </p>
          <h2 className="text-[clamp(2.8rem,9vw,9.5rem)] font-black leading-[0.9] uppercase tracking-tighter">
            THE NEW
            <br />
            STANDARD
            <br />
            OF SHORT
          </h2>
        </div>

        <hr className="my-[1.5vw] border-none border-t border-white/25" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 my-2">
          <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
            <p className="text-3xl sm:text-4xl font-black">2K Ultra</p>
            <h3 className="font-dongle text-3xl text-white font-bold leading-none mt-1">
              초고화질 디테일
            </h3>
            <p className="text-xs text-white/80 mt-2 leading-relaxed">
              최신 Nano Banana Pro 렌더러로 인물의 표정과 질감을 뭉개짐 없이 선명하게 복원합니다.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
            <p className="text-3xl sm:text-4xl font-black">9:16 Ratio</p>
            <h3 className="font-dongle text-3xl text-white font-bold leading-none mt-1">
              모바일 풀스크린 규격
            </h3>
            <p className="text-xs text-white/80 mt-2 leading-relaxed">
              인스타그램 릴스, 유튜브 쇼츠, 틱톡 알고리즘에 별도 크롭 없이 곧바로 업로드 가능합니다.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
            <p className="text-3xl sm:text-4xl font-black">1-Click Pay</p>
            <h3 className="font-dongle text-3xl text-white font-bold leading-none mt-1">
              토스페이먼츠 간편결제
            </h3>
            <p className="text-xs text-white/80 mt-2 leading-relaxed">
              정기 구독 부담 없이, 필요한 만큼만 1회성 크레딧을 안전하게 충전할 수 있습니다.
            </p>
          </div>
        </div>

        <hr className="my-[1.5vw] border-none border-t border-white/25" />

        <p className="mt-auto max-w-[50ch] text-[clamp(1rem,1.8vw,1.4rem)] font-normal leading-relaxed opacity-90">
          장비와 예산의 한계를 넘어 오직 아이디어만으로 승부하세요. MOSAIC AI가 당신의 든든한 제작 스튜디오가 되어드립니다.
        </p>
      </FlowSection>

      {/* =================================================================
          슬라이드 05: 참여 안내 및 스튜디오 진입 (Ready to Begin)
          - 상단 넘버링/보조 텍스트 제거
          - Dongle 폰트로 친근하고 매력적인 CTA 강조
          ================================================================= */}
      <FlowSection
        aria-label="스튜디오 시작하기"
        style={{ backgroundColor: '#09090b', color: '#ffffff' }}
      >
        <div className="pt-2">
          <p className="font-dongle text-4xl sm:text-5xl md:text-6xl text-emerald-400 leading-none mb-2">
            지금 시작하면 즉시 무료 크레딧 증정
          </p>
          <h2 className="text-[clamp(3.2rem,11vw,12rem)] font-black leading-[0.88] uppercase tracking-tighter text-[#E1E0CC]">
            READY
            <br />
            TO
            <br />
            CREATE?
          </h2>
        </div>

        <hr className="my-[1.5vw] border-none border-t border-zinc-800" />

        <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6">
          <p className="max-w-[48ch] text-[clamp(1rem,2vw,1.5rem)] font-normal leading-relaxed text-zinc-400">
            카드 등록 없이 30초 만에 가입하고, 바이럴 숏폼의 주인공이 되어보세요.
          </p>

          <Link
            href="/generate"
            className="group inline-flex items-center gap-3 self-start rounded-full bg-emerald-500 hover:bg-emerald-400 py-2.5 pl-7 pr-2.5 text-base sm:text-lg font-black text-black transition-all hover:gap-4 shadow-[0_0_35px_rgba(16,185,129,0.35)] active:scale-95 cursor-pointer"
          >
            <span>스튜디오 바로가기</span>
            <span className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-105">
              <ArrowRight className="h-5 w-5 text-emerald-400" />
            </span>
          </Link>
        </div>
      </FlowSection>
    </FlowArt>
  );
}
