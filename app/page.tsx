"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";

// =================================================================
// 🎨 Graphite Mono 테마 기반 데이터 모델
// =================================================================
interface PresetTopic {
  id: string;
  category: string;
  title: string;
  hookLine: string;
  estimatedViews: string;
  retentionRate: string;
  duration: string;
  tag: string;
}

// 숏폼 바이럴 추천 프리셋 주제
const TOPIC_PRESETS: PresetTopic[] = [
  {
    id: "finance",
    category: "재테크·지식",
    tag: "초간단 꿀팁",
    title: "사회초년생이 첫 월급 받자마자 무조건 세팅해야 할 통장 3개",
    hookLine: "“월 200 받아도 1년 만에 2천 모으는 사람들의 유일한 차이점.”",
    estimatedViews: "185만 회",
    retentionRate: "89.2%",
    duration: "45초",
  },
  {
    id: "story",
    category: "사이다·스토리",
    tag: "알고리즘 폭발",
    title: "동창회에서 무시당하던 친구가 10년 뒤 타고 나타난 차의 정체",
    hookLine: "“'너 아직도 그 일 해?' 비웃던 친구 입을 다물게 한 1장의 명함.”",
    estimatedViews: "340만 회",
    retentionRate: "93.8%",
    duration: "58초",
  },
  {
    id: "tech",
    category: "AI·생산성",
    tag: "직장인 필수",
    title: "야근 3시간 줄여주는 2026 무료 AI 툴 Top 4",
    hookLine: "“이 사이트 하나 알면 보고서 작성이 3분 만에 끝납니다.”",
    estimatedViews: "120만 회",
    retentionRate: "84.5%",
    duration: "35초",
  },
  {
    id: "mystery",
    category: "미스터리",
    tag: "시청유지 95%",
    title: "비행기 승무원들이 절대 마시지 않는다는 기내 음료의 비밀",
    hookLine: "“승무원들이 커피 대신 항상 텀블러를 챙기는 진짜 이유.”",
    estimatedViews: "260만 회",
    retentionRate: "91.7%",
    duration: "40초",
  },
];

// 자주 묻는 질문(FAQ)
const FAQ_ITEMS = [
  {
    q: "정말 텍스트 한 줄만 입력하면 영상이 완성되나요?",
    a: "네. Mosaic AI의 Graphite 엔진이 주제를 분석하여 [초반 3초 후킹 대본] ➡️ [자연스러운 감정 AI 음성] ➡️ [장면별 4K B-roll 영상 소스] ➡️ [다이내믹 네온 자막]을 원클릭으로 60초 안에 합성합니다.",
  },
  {
    q: "유튜브 쇼츠, 인스타 릴스 수익 창출에 저작권 문제는 없나요?",
    a: "생성되는 모든 영상 클립, 배경음악(BGM), AI 보이스는 상업적 이용이 승인된 라이선스 자산으로만 구성됩니다. 채널 경고 걱정 없이 자유롭게 수익을 창출하세요.",
  },
  {
    q: "자막 폰트나 음성 속도, 이미지를 내가 직접 수정할 수 있나요?",
    a: "물론입니다. 원클릭 자동 생성 후 제공되는 타임라인 에디터에서 자막 문구, 음성 톤, 배경 영상 소스를 클릭 한 번으로 손쉽게 교체할 수 있습니다.",
  },
  {
    q: "무료로 체험해볼 수 있나요?",
    a: "회원가입 즉시 3편의 고화질 풀버전 바이럴 영상을 무료로 제작할 수 있는 크레딧을 제공합니다. 신용카드 등록 없이 즉시 시작하세요.",
  },
];

export default function Home() {
  const router = useRouter();
  // Firebase 인증 및 Firestore 사용자 데이터 훅 사용
  const { user, userData, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 사용자가 입력하는 프롬프트 주제
  const [prompt, setPrompt] = useState("");
  // 선택된 프리셋 주제
  const [selectedTopic, setSelectedTopic] = useState<PresetTopic>(TOPIC_PRESETS[0]);
  // 생성 중 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  // 완료 모달 상태
  const [showDoneModal, setShowDoneModal] = useState(false);
  // FAQ 토글 상태
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  // 인터랙티브 옵션 스위치 (Graphite Mono 스타일 컨트롤)
  const [autoSubtitles, setAutoSubtitles] = useState(true);
  const [bgmEnhance, setBgmEnhance] = useState(true);
  const [videoPacing, setVideoPacing] = useState(80);

  // 원클릭 영상 제작 시뮬레이션
  const handleCreateVideo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetTopic = prompt.trim() || selectedTopic.title;

    setIsGenerating(true);
    setGenerationProgress(15);
    setProgressText(`"${targetTopic.slice(0, 15)}..." 3초 후킹 대본 작성 중...`);

    setTimeout(() => {
      setGenerationProgress(45);
      setProgressText("감정 표현 AI 보이스 내레이션 합성 중...");
    }, 900);

    setTimeout(() => {
      setGenerationProgress(75);
      setProgressText("4K 스톡 비디오 컷편집 및 다이내믹 자막 싱크 중...");
    }, 1800);

    setTimeout(() => {
      setGenerationProgress(100);
      setProgressText("영상 렌더링 완료!");
      setIsGenerating(false);
      setShowDoneModal(true);
    }, 2700);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased selection:bg-white selection:text-black">
      {/* =================================================================
          1. 상단 미니멀 네비게이션 (Graphite Mono 스타일)
          ================================================================= */}
      <header className="sticky top-0 z-40 bg-[#09090b]/85 backdrop-blur-md border-b border-[#27272a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* 브랜드 로고 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black font-black text-sm tracking-wider">
              M
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-lg">MOSAIC</span>
              <span className="text-[11px] font-mono text-[#a1a1aa] px-2 py-0.5 rounded-full bg-[#18181b] border border-[#27272a]">
                Graphite Mono
              </span>
            </div>
          </div>

          {/* 메뉴 링크 (데스크톱) */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#a1a1aa]">
            <a href="#workflow" className="hover:text-white transition-colors">작동 방식</a>
            <a href="#features" className="hover:text-white transition-colors">엔진 기능</a>
            <a href="#preview" className="hover:text-white transition-colors">인터랙티브 데모</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* 우측 컴포넌트 버튼 (Primary / Ghost) */}
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
                <span>새 영상 만들기</span>
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
          2. 히어로 섹션 (Hero Section)
          ================================================================= */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        {/* 상단 Graphite Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18181b] border border-[#27272a] text-[#a1a1aa] text-xs font-mono mb-8">
          <span className="w-2 h-2 rounded-full bg-[#ff5a5a]"></span>
          <span>Next-Gen Viral AI Engine · radius 1rem</span>
        </div>

        {/* 메인 타이틀: DM Sans 굵은 Heading 스타일 */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.12]">
          한 줄의 텍스트가 <br className="hidden sm:inline" />
          <span className="text-[#a1a1aa]">1분 만에 100만 뷰</span> 영상으로.
        </h1>

        {/* 서브텍스트: Subtitle text */}
        <p className="mt-6 text-base sm:text-lg text-[#a1a1aa] max-w-2xl mx-auto leading-relaxed font-normal">
          복잡한 컷편집, 어색한 기계음, 자막 싱크 맞추기는 이제 끝났습니다. <br className="hidden sm:inline" />
          시청 지속률 90%의 후킹 대본부터 고화질 숏폼 합성까지 <strong className="text-white font-medium">원클릭</strong>으로 제작하세요.
        </p>

        {/* =================================================================
            3. 원클릭 프롬프트 인풋 바 (Graphite Mono Card & Inputs)
            ================================================================= */}
        <div className="mt-10 max-w-2xl mx-auto">
          <form
            onSubmit={handleCreateVideo}
            className="p-2 sm:p-2.5 rounded-2xl bg-[#141416] border border-[#27272a] shadow-xl flex flex-col sm:flex-row items-center gap-2.5"
          >
            {/* 텍스트 입력부 */}
            <div className="w-full flex items-center pl-3">
              <svg className="w-4 h-4 text-[#71717a] mr-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <input
                id="prompt-input"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 사회초년생이 절대 사면 안 되는 감가상각 심한 물건 Top 3"
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-[#52525b] focus:outline-none py-2"
              />
            </div>

            {/* 프라이머리 액션 버튼 */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full sm:w-auto shrink-0 font-medium px-5 py-3 rounded-xl bg-white text-black hover:bg-[#e4e4e7] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>합성 중...</span>
                </>
              ) : (
                <>
                  <span>원클릭 생성</span>
                  <span className="text-xs">→</span>
                </>
              )}
            </button>
          </form>

          {/* Graphite 컴포넌트 스타일 칩 (Chips) */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <span className="text-[#71717a] mr-1">추천 프롬프트:</span>
            {[
              "💰 월급 200 통장 쪼개기",
              "☕ 기내 음료 비밀",
              "💡 생산성 AI 툴 Top 4",
              "🚗 10년 뒤 동창회 실화",
            ].map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(topic.replace(/^[^\s]+\s/, ""))}
                className="px-2.5 py-1 rounded-full bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] hover:text-white transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Graphite 테마 수치 요약 */}
        <div className="mt-12 flex items-center justify-center gap-8 text-xs text-[#71717a] font-mono">
          <div>
            제작 소요시간 <strong className="text-white font-sans ml-1">45초</strong>
          </div>
          <div className="w-1 h-1 rounded-full bg-[#27272a]"></div>
          <div>
            평균 시청지속률 <strong className="text-[#ff5a5a] font-sans ml-1">89.4%</strong>
          </div>
          <div className="w-1 h-1 rounded-full bg-[#27272a]"></div>
          <div>
            수익 창출 저작권 <strong className="text-white font-sans ml-1">100% 안심</strong>
          </div>
        </div>
      </section>

      {/* =================================================================
          4. 인터랙티브 비디오 시뮬레이터 & Graphite 컴포넌트 컨트롤러
          ================================================================= */}
      <section id="preview" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="rounded-2xl bg-[#141416] border border-[#27272a] p-6 sm:p-8 shadow-2xl">
          {/* 상단 탭 헤더 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#27272a] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">Interactive Studio</span>
                <span className="px-2 py-0.5 rounded-full bg-[#ff5a5a]/15 text-[#ff5a5a] text-[10px] font-mono border border-[#ff5a5a]/30">
                  LIVE DEMO
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                실시간 생성 숏폼 프리뷰
              </h2>
            </div>

            {/* 주제 선택 버튼 그룹 (Graphite Mono 컴포넌트 모음) */}
            <div className="flex flex-wrap items-center gap-2">
              {TOPIC_PRESETS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopic(t)}
                  className={`text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                    selectedTopic.id === t.id
                      ? "bg-white text-black"
                      : "bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]"
                  }`}
                >
                  {t.category}
                </button>
              ))}
            </div>
          </div>

          {/* 중앙 영역: 비디오 프리뷰 (좌) + Graphite 세팅 패널 (우) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-center">
            {/* 좌측: 9:16 모바일 숏폼 뷰어 */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[280px] aspect-[9/16] rounded-2xl bg-black border border-[#27272a] overflow-hidden relative flex flex-col justify-between p-4 shadow-2xl">
                {/* 비디오 배경 그라디언트 레이어 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/60 to-black/80 z-0"></div>

                {/* 상단 상태 인디케이터 */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-[#a1a1aa]">
                  <span className="px-2 py-0.5 rounded-md bg-[#ff5a5a] text-white font-medium text-[10px]">
                    VIRAL HOOK
                  </span>
                  <span className="font-mono">0:12 / {selectedTopic.duration}</span>
                </div>

                {/* 중앙: 3초 후킹 자막 (Graphite Mono 타이포그래피) */}
                <div className="relative z-10 text-center my-auto px-2">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-white text-[10px] font-mono mb-3">
                    {selectedTopic.tag}
                  </span>
                  <p className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-md">
                    {selectedTopic.hookLine}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-[#27272a] text-[10px] text-[#a1a1aa]">
                    <span>시청유지율</span>
                    <strong className="text-[#ff5a5a]">{selectedTopic.retentionRate}</strong>
                  </div>
                </div>

                {/* 하단: 타이틀 정보 및 컨트롤 바 */}
                <div className="relative z-10 space-y-2">
                  <p className="text-xs text-zinc-300 font-medium line-clamp-2">
                    {selectedTopic.title}
                  </p>
                  {/* 슬라이더 바 (이미지 레퍼런스 스타일) */}
                  <div className="w-full h-1 bg-[#27272a] rounded-full overflow-hidden">
                    <div className="h-full bg-white w-2/5 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측: 세팅 컨트롤러 (사용자 첨부 테마 컴포넌트 직접 반영) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-mono text-[#71717a]">Topic Details</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedTopic.title}
                </h3>
                <p className="text-sm text-[#a1a1aa] mt-2 leading-relaxed">
                  시청자가 넘기지 못하게 만드는 뇌과학 기반 첫 문장 구조와 영상 소스를 AI가 자동 매칭했습니다.
                </p>
              </div>

              {/* Graphite Mono 컴포넌트 컨트롤 패널 (토글, 슬라이더) */}
              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-4">
                <div className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">
                  Engine Controls
                </div>

                {/* 컨트롤 1: 다이내믹 네온 자막 스위치 토글 */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">단어 단위 다이내믹 자막</div>
                    <div className="text-xs text-[#71717a]">음성과 0.01초 일치하는 팝업 효과</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoSubtitles(!autoSubtitles)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      autoSubtitles ? "bg-white" : "bg-[#27272a]"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                        autoSubtitles ? "left-6" : "left-1 bg-[#71717a]"
                      }`}
                    ></span>
                  </button>
                </div>

                {/* 컨트롤 2: BGM 오디오 믹싱 토글 */}
                <div className="flex items-center justify-between border-t border-[#27272a] pt-3">
                  <div>
                    <div className="text-sm font-medium text-white">알고리즘 추천 BGM 자동 매칭</div>
                    <div className="text-xs text-[#71717a]">상업 라이선스 음원 자동 볼륨 덕킹(Ducking)</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBgmEnhance(!bgmEnhance)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      bgmEnhance ? "bg-white" : "bg-[#27272a]"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                        bgmEnhance ? "left-6" : "left-1 bg-[#71717a]"
                      }`}
                    ></span>
                  </button>
                </div>

                {/* 컨트롤 3: 영상 템포 슬라이더 (레퍼런스 이미지 슬라이더 구현) */}
                <div className="border-t border-[#27272a] pt-3">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-[#a1a1aa]">숏폼 영상 전개 속도 (Fast-Paced)</span>
                    <span className="font-mono text-white">{videoPacing}%</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={videoPacing}
                      onChange={(e) => setVideoPacing(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>
              </div>

              {/* 하단 실행 버튼 */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPrompt(selectedTopic.title);
                    handleCreateVideo();
                  }}
                  className="flex-1 px-5 py-3 rounded-xl bg-white text-black font-medium hover:bg-[#e4e4e7] transition-all text-sm active:scale-95 text-center cursor-pointer"
                >
                  이 설정으로 1초 생성하기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("prompt-input");
                    el?.focus();
                    setPrompt(selectedTopic.title);
                  }}
                  className="px-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white text-sm transition-colors text-center"
                >
                  프롬프트 복사
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          5. 3단계 워크플로우 (How it Works - Graphite Mono Cards)
          ================================================================= */}
      <section id="workflow" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-[#27272a]">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">Workflow</span>
          <h2 className="text-3xl font-bold text-white mt-2">
            단 3단계, 누구나 1분 완성
          </h2>
          <p className="text-sm text-[#71717a] mt-2">
            편집 기술이 필요 없는 가장 직관적인 바이럴 영상 파이프라인
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-[#141416] border border-[#27272a] hover:border-zinc-500 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center font-mono text-xs text-[#a1a1aa] mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">키워드 또는 링크 입력</h3>
            <p className="text-xs text-[#71717a] leading-relaxed">
              아이디어 한 줄, 블로그 링크, 뉴스 기사를 넣으세요. AI가 핵심 메시지를 요약합니다.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-[#141416] border border-white/40 shadow-sm transition-colors">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-mono text-xs font-bold mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">원클릭 AI 멀티모달 합성</h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              3초 후킹 대본, 자연스러운 성우 보이스, 4K 클립, 애니메이션 자막을 한번에 합성합니다.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-[#141416] border border-[#27272a] hover:border-zinc-500 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center font-mono text-xs text-[#a1a1aa] mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">플랫폼 즉시 다운로드</h3>
            <p className="text-xs text-[#71717a] leading-relaxed">
              워터마크 없는 무손실 9:16 비디오를 유튜브 쇼츠, 릴스, 틱톡에 곧바로 업로드하세요.
            </p>
          </div>
        </div>
      </section>

      {/* =================================================================
          6. 핵심 기능 4선 (Features - Graphite Monochrome Grid)
          ================================================================= */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-[#27272a]">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">Features</span>
          <h2 className="text-3xl font-bold text-white mt-2">
            알고리즘을 관통하는 4가지 기술
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 기능 1 */}
          <div className="p-7 rounded-2xl bg-[#141416] border border-[#27272a]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">
                Hook Algorithm
              </span>
              <span className="w-2 h-2 rounded-full bg-[#ff5a5a]"></span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3초 이탈 방지 후킹 대본</h3>
            <p className="text-sm text-[#71717a] leading-relaxed">
              조회수 100만 이상 터진 상위 1% 숏폼 콘텐츠 1만 편의 도입부 화법을 분석하여 시청자의 엄지손가락을 멈추게 만듭니다.
            </p>
          </div>

          {/* 기능 2 */}
          <div className="p-7 rounded-2xl bg-[#141416] border border-[#27272a]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">
                Emotional TTS
              </span>
              <span className="w-2 h-2 rounded-full bg-white"></span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">초자연스러운 한국어 감정 보이스</h3>
            <p className="text-sm text-[#71717a] leading-relaxed">
              어색하고 뻣뻣한 기계음을 탈피했습니다. 속삭임, 강조, 자연스러운 호흡까지 표현하는 20가지 이상의 프리미엄 AI 성우를 지원합니다.
            </p>
          </div>

          {/* 기능 3 */}
          <div className="p-7 rounded-2xl bg-[#141416] border border-[#27272a]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">
                Dynamic Captions
              </span>
              <span className="w-2 h-2 rounded-full bg-white"></span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">단어 단위 키네틱 팝업 자막</h3>
            <p className="text-sm text-[#71717a] leading-relaxed">
              소리 없이 영상을 시청하는 70%의 모바일 유저를 위해, 음성과 완벽히 일치하는 단어별 하이라이트 팝업 자막을 제공합니다.
            </p>
          </div>

          {/* 기능 4 */}
          <div className="p-7 rounded-2xl bg-[#141416] border border-[#27272a]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">
                Licensed Assets
              </span>
              <span className="w-2 h-2 rounded-full bg-[#ff5a5a]"></span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">상업적 100% 안심 스톡 & BGM</h3>
            <p className="text-sm text-[#71717a] leading-relaxed">
              글로벌 상업 라이선스를 획득한 고화질 비디오 클립과 무손실 음원만을 자동 매칭하여 유튜브 수익 창출 채널도 안전합니다.
            </p>
          </div>
        </div>
      </section>

      {/* =================================================================
          7. 자주 묻는 질문 (FAQ Section)
          ================================================================= */}
      <section id="faq" className="py-20 px-4 sm:px-6 max-w-3xl mx-auto border-t border-[#27272a]">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">FAQ</span>
          <h2 className="text-3xl font-bold text-white mt-2">자주 묻는 질문</h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-[#141416] border border-[#27272a] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between text-sm font-medium text-white hover:text-zinc-300 transition-colors"
              >
                <span>{item.q}</span>
                <span className="font-mono text-[#a1a1aa] text-base ml-4 shrink-0">
                  {openFaq === index ? "−" : "+"}
                </span>
              </button>
              {openFaq === index && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#a1a1aa] leading-relaxed border-t border-[#27272a]/60">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =================================================================
          8. 최종 하단 전환 CTA (Call to Action)
          ================================================================= */}
      <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#141416] border border-[#27272a] text-center shadow-2xl relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-4">
            <span className="text-xs font-mono text-[#a1a1aa] px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a]">
              Start Creating Now
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              지금 바로 3편의 영상을 <br />
              무료로 제작해 보세요.
            </h2>
            <p className="text-sm text-[#71717a]">
              카드 등록 없이 30초 만에 가입하고, 바이럴 숏폼의 주인공이 되세요.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById("prompt-input");
                  el?.focus();
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-black font-medium hover:bg-[#e4e4e7] transition-all text-sm active:scale-95 shadow-md cursor-pointer"
              >
                무료 영상 제작 시작 →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          9. 푸터 (Footer)
          ================================================================= */}
      <footer className="border-t border-[#27272a] py-10 px-4 sm:px-6 text-xs text-[#71717a]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">MOSAIC</span>
            <span className="font-mono">· Graphite Mono Edition</span>
            <span>© 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">이용약관</a>
            <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-white transition-colors">고객지원</a>
          </div>
        </div>
      </footer>

      {/* =================================================================
          🎉 영상 생성 완료 모달 (Graphite Card Style)
          ================================================================= */}
      {showDoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#141416] border border-[#27272a] p-6 shadow-2xl text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center mx-auto text-white text-base">
              ✓
            </div>
            <h3 className="text-xl font-bold text-white">바이럴 영상 합성 완료</h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              선택하신 주제의 후킹 대본, AI 음성, 팝업 자막이 모두 결합되었습니다.
            </p>

            <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] text-left text-xs font-mono space-y-2">
              <div className="flex justify-between text-[#71717a]">
                <span>Duration</span>
                <span className="text-white font-sans">{selectedTopic.duration}</span>
              </div>
              <div className="flex justify-between text-[#71717a]">
                <span>Hook Score</span>
                <span className="text-[#ff5a5a] font-sans">98 / 100</span>
              </div>
              <div className="flex justify-between text-[#71717a]">
                <span>Aspect Ratio</span>
                <span className="text-white font-sans">9:16 (Shorts/Reels/TikTok)</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDoneModal(false);
                  router.push("/generate");
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white text-black font-medium text-xs hover:bg-[#e4e4e7] transition-all cursor-pointer"
              >
                영상 다운로드 및 편집기 열기 →
              </button>
              <button
                type="button"
                onClick={() => setShowDoneModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white text-xs transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          ⏳ 진행 상태 프로그레스 바 (Graphite Mono Slider Style)
          ================================================================= */}
      {isGenerating && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md p-4 rounded-2xl bg-[#141416] border border-[#27272a] shadow-2xl text-left space-y-2 backdrop-blur-md">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white font-medium">{progressText}</span>
            <span className="font-mono text-[#a1a1aa]">{generationProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#27272a] rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 rounded-full"
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* =================================================================
          🔐 Graphite Mono 스타일 Firebase 로그인/회원가입 모달
          ================================================================= */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
