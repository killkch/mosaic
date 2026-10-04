"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { GenerationPipeline } from "@/components/GenerationPipeline";
import CreditPurchaseModal from "@/components/CreditPurchaseModal";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// =================================================================
// 🎬 4대 시네마틱 3D 비디오 슬롯 데이터 인터페이스
// =================================================================
interface VideoSlot {
  id: string;
  corner: "tl" | "tr" | "bl" | "br"; // 10시(좌상), 2시(우상), 8시(좌하), 4시(우하)
  title: string;
  subscription: string;
  badge: string;
  videoSrc: string; // public 디렉토리의 샘플 영상 경로 (/sample1.mp4 등)
  defaultTransform: string;
  hoverTransform: string;
  accentColor: string;
}

// 4개 방향별 비디오 카드 정의
const VIDEO_SLOTS: VideoSlot[] = [
  {
    id: "baseball",
    corner: "tl",
    title: "야구 중계샷",
    subscription: "9회말 2아웃 만루, 시선을 사로잡는 역전 홈런 초밀착 타석 뷰",
    badge: "LIVE STADIUM",
    videoSrc: "/sample1.mp4",
    defaultTransform: "perspective(1200px) rotateY(14deg) rotateX(-8deg) scale(0.96)",
    hoverTransform: "perspective(1200px) rotateY(4deg) rotateX(-2deg) scale(1.03)",
    accentColor: "#10b981",
  },
  {
    id: "fancam",
    corner: "tr",
    title: "아이돌 직캠",
    subscription: "4K 60fps 무대 초밀착 페이스캠 & 킬링 파트 단독 포커스",
    badge: "4K FANCAM",
    videoSrc: "/sample2.mp4",
    defaultTransform: "perspective(1200px) rotateY(-14deg) rotateX(-8deg) scale(0.96)",
    hoverTransform: "perspective(1200px) rotateY(-4deg) rotateX(-2deg) scale(1.03)",
    accentColor: "#ec4899",
  },
  {
    id: "audience",
    corner: "bl",
    title: "쇼미 관객석",
    subscription: "묵직한 808 베이스에 맞춘 떼창 반응과 다이내믹 슬로우모션",
    badge: "HIPHOP STAGE",
    videoSrc: "/sample3.mp4",
    defaultTransform: "perspective(1200px) rotateY(14deg) rotateX(8deg) scale(0.96)",
    hoverTransform: "perspective(1200px) rotateY(4deg) rotateX(2deg) scale(1.03)",
    accentColor: "#f59e0b",
  },
  {
    id: "street",
    corner: "br",
    title: "스트릿 패션",
    subscription: "성수동 런웨이 감성의 트렌디한 숏폼 OOTD 워킹 스냅샷",
    badge: "STREET OOTD",
    videoSrc: "/sample4.mp4",
    defaultTransform: "perspective(1200px) rotateY(-14deg) rotateX(8deg) scale(0.96)",
    hoverTransform: "perspective(1200px) rotateY(-4deg) rotateX(2deg) scale(1.03)",
    accentColor: "#6366f1",
  },
];

// 고유한 파일 저장을 위한 타임스탬프 헬퍼 함수 (React 순수성 규칙 준수)
function getStorageTimestamp(): number {
  return Date.now();
}

export default function GeneratePage() {
  const { user, userData, logout, deductCredit } = useAuth();

  // 각 슬롯별로 사용자가 첨부한 이미지 URL 상태
  const [attachedImages, setAttachedImages] = useState<Record<string, string>>({});
  // 현재 호버 중인 카드 ID
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  // 우측 상단 유저 메뉴 토글
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // 💳 토스페이먼츠 크레딧 충전 모달 상태
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isRequiredNotice, setIsRequiredNotice] = useState(false);

  // 🌟 파이프라인 및 Replicate 생성 관련 상태
  const [isPipelineActive, setIsPipelineActive] = useState(false);
  const [activeSlot, setActiveSlot] = useState<VideoSlot | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingStorage, setIsSavingStorage] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCreditError, setIsCreditError] = useState(false);
  const [billingUrl, setBillingUrl] = useState<string>("https://replicate.com/account/billing#billing");
  const [isDemo, setIsDemo] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);
  const [lastBase64Data, setLastBase64Data] = useState<string>("");

  // 각 카드별 input file ref
  const fileInputRefs = {
    baseball: useRef<HTMLInputElement>(null),
    fancam: useRef<HTMLInputElement>(null),
    audience: useRef<HTMLInputElement>(null),
    street: useRef<HTMLInputElement>(null),
  };

  // 카드 클릭 시 파일 선택창 열기 (파이프라인 활성화 중이 아닐 때만)
  const handleCardClick = (slotKey: "baseball" | "fancam" | "audience" | "street") => {
    if (!isPipelineActive) {
      fileInputRefs[slotKey].current?.click();
    }
  };

  // 🌟 사용자가 사진을 첨부했을 때 실행되는 핸들러
  const handleFileChange = async (
    slot: VideoSlot,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🪙 [크레딧 잔액 검사] 영상 생성 시 1 크레딧 소모
    const currentCredits = userData?.credits ?? 0;
    if (currentCredits < 1) {
      setIsRequiredNotice(true);
      setIsPurchaseModalOpen(true);
      // 파일 입력값 리셋
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAttachedImages((prev) => ({
      ...prev,
      [slot.id]: previewUrl,
    }));

    // 파이프라인 상태 활성화 (4개 카드가 모서리로 촥 펼쳐지고 회전 시작!)
    setActiveSlot(slot);
    setOriginalImageUrl(previewUrl);
    setGeneratedImageUrl(null);
    setGenerationId(null);
    setErrorMsg(null);
    setIsPipelineActive(true);

    // 파일 및 base64 캐시 저장
    setLastUploadedFile(file);
    setIsCreditError(false);
    setIsDemo(false);

    // 파일을 base64 문자열로 변환하여 Replicate API에 전달
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setLastBase64Data(base64Data);
      await startImageGeneration(slot, file, base64Data, false);
    };
  };

  // 🚀 Replicate API 호출 & Firebase Storage & Firestore generations 테이블 저장
  const startImageGeneration = async (
    slot: VideoSlot,
    originalFile: File,
    base64Data: string,
    useDemo: boolean = false
  ) => {
    setIsGenerating(true);
    setErrorMsg(null);
    setIsCreditError(false);

    try {
      // 1. Next.js 서버사이드 API 호출 (Replicate google/nano-banana-pro 모델 실행)
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: base64Data,
          category: slot.title,
          userId: user?.uid || "guest",
          useDemoFallback: useDemo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.isCreditError || res.status === 402) {
          setIsCreditError(true);
          if (data.billingUrl) setBillingUrl(data.billingUrl);
        }
        setErrorMsg(data.error || "이미지 생성 요청 실패");
        setIsGenerating(false);
        setIsSavingStorage(false);
        return;
      }

      // Replicate 크레딧 소진으로 데모 모드가 실행된 경우 경고 상태 플래그 설정
      if (data.isCreditWarning) {
        setIsCreditError(true);
        if (data.billingUrl) setBillingUrl(data.billingUrl);
      }
      if (data.isDemo) {
        setIsDemo(true);
      }

      const aiImageUrl = data.imageUrl;
      setGeneratedImageUrl(aiImageUrl);
      setIsGenerating(false);

      // 2. 💾 Firebase Storage에 생성된 이미지 영구 저장
      setIsSavingStorage(true);
      const timestamp = getStorageTimestamp();
      const currentUid = user?.uid || "guest";

      // 원본 사진 저장
      const originalRef = ref(
        storage,
        `generations/${currentUid}/${timestamp}_original.png`
      );
      await uploadBytes(originalRef, originalFile);
      const originalStorageUrl = await getDownloadURL(originalRef);

      // AI 생성된 이미지 파일 다운로드 후 Storage에 업로드
      let generatedStorageUrl = aiImageUrl;
      try {
        const imageRes = await fetch(aiImageUrl);
        const imageBlob = await imageRes.blob();
        const generatedRef = ref(
          storage,
          `generations/${currentUid}/${timestamp}_generated.png`
        );
        await uploadBytes(generatedRef, imageBlob);
        generatedStorageUrl = await getDownloadURL(generatedRef);
      } catch (storageErr) {
        console.warn("Storage 저장 중 fallback URL 사용:", storageErr);
      }
      setIsSavingStorage(false);

      // 3. 📝 Firestore 'generations' 컬렉션에 작업 레코드 기록
      const docRef = await addDoc(collection(db, "generations"), {
        userId: currentUid,
        category: slot.title,
        prompt: data.prompt,
        model: "google/nano-banana-pro",
        originalImageUrl: originalStorageUrl,
        generatedImageUrl: generatedStorageUrl,
        createdAt: serverTimestamp(),
        status: "completed",
        isDemo: data.isDemo || useDemo,
      });

      setGenerationId(docRef.id);

      // 4. 🪙 영상 제작 성공 시 1 크레딧 원자적 차감
      await deductCredit(1);
    } catch (err: unknown) {
      const error = err as Error;
      console.warn("AI 생성 파이프라인 알림:", error);
      setErrorMsg(error.message || "영상 생성 파이프라인 진행 중 오류가 발생했습니다.");
      setIsGenerating(false);
      setIsSavingStorage(false);
    }
  };

  // 데모 모드로 파이프라인 계속 진행
  const handleTryDemo = async () => {
    if (!activeSlot || !lastUploadedFile) return;
    setIsDemo(true);
    await startImageGeneration(activeSlot, lastUploadedFile, lastBase64Data, true);
  };

  // 파이프라인 초기화 (다시 4개 카드 모드로 복귀)
  const handleResetPipeline = () => {
    setIsPipelineActive(false);
    setActiveSlot(null);
    setGeneratedImageUrl(null);
    setErrorMsg(null);
    setIsCreditError(false);
    setIsDemo(false);
    setGenerationId(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans select-none overflow-hidden relative">
      {/* =================================================================
          1. 상단 미니멀 네비게이션 (좌측 로고, 우측 유저 아이콘)
          ================================================================= */}
      <header className="h-16 px-6 sm:px-10 flex items-center justify-between border-b border-[#27272a]/60 bg-[#09090b]/80 backdrop-blur-md z-30 shrink-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black font-black text-sm tracking-wider shadow-sm group-hover:scale-105 transition-transform">
            M
          </div>
          <span className="font-extrabold text-white tracking-tight text-lg">
            MOSAIC
          </span>
          <span className="text-[10px] font-mono text-[#a1a1aa] px-2 py-0.5 rounded-full bg-[#18181b] border border-[#27272a]">
            STUDIO
          </span>
        </Link>

        {/* 우측 상단: 크레딧 충전 버튼 및 유저 프로필 메뉴 */}
        <div className="flex items-center gap-3">
          {/* 🪙 크레딧 충전 뱃지 버튼 (클릭 시 토스페이먼츠 모달 오픈) */}
          <button
            onClick={() => {
              setIsRequiredNotice(false);
              setIsPurchaseModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.12)]"
            title="토스페이먼츠 크레딧 충전"
          >
            <span>🪙</span>
            <span>{userData?.credits ?? 0} 크레딧</span>
            <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.5 rounded-full font-black">
              충전
            </span>
          </button>

          {/* 유저 프로필 아이콘 및 메뉴 */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] transition-all cursor-pointer active:scale-95"
              aria-label="사용자 프로필"
            >
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs">
                  {user?.email ? user.email.slice(0, 2).toUpperCase() : "👤"}
                </div>
              )}
            </button>

            {/* 유저 드롭다운 메뉴 */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#141416] border border-[#27272a] p-3 shadow-2xl z-50 animate-fade-in text-left">
                <div className="px-3 py-2 border-b border-[#27272a]">
                  <div className="text-xs font-mono text-[#71717a]">Signed in as</div>
                  <div className="text-sm font-medium text-white truncate mt-0.5">
                    {user?.email || "게스트 사용자"}
                  </div>
                  {userData && (
                    <div className="text-xs text-emerald-400 font-mono mt-1 flex items-center justify-between">
                      <span>✨ 보유 크레딧:</span>
                      <span className="font-bold">{userData.credits}개</span>
                    </div>
                  )}
                </div>
                <div className="pt-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsRequiredNotice(false);
                      setIsPurchaseModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors font-semibold flex items-center justify-between cursor-pointer"
                  >
                    <span>🪙 크레딧 충전하기</span>
                    <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">
                      토스결제
                    </span>
                  </button>
                  <Link
                    href="/"
                    className="block px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-white hover:bg-[#18181b] rounded-lg transition-colors"
                  >
                    홈으로 이동
                  </Link>
                  {user && (
                    <button
                      onClick={() => logout()}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#ff5a5a] hover:bg-[#ff5a5a]/10 rounded-lg transition-colors cursor-pointer"
                    >
                      로그아웃
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =================================================================
          2. 화면 중앙 캔버스: 파이프라인 활성화 여부에 따른 다이내믹 뷰
          ================================================================= */}
      <main className="flex-1 p-4 sm:p-8 flex items-center justify-center relative overflow-hidden">
        {/* 미세한 배경 글로우 */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[140px] pointer-events-none -z-10"></div>

        {/* 🌟 [케이스 A] 사진 첨부 완료 시: 중앙에 3단계 파이프라인 컴포넌트 등장! */}
        {isPipelineActive && (
          <div className="w-full relative z-20">
            <GenerationPipeline
              categoryTitle={activeSlot?.title || "바이럴 숏폼"}
              originalImage={originalImageUrl}
              generatedImage={generatedImageUrl}
              isGenerating={isGenerating}
              isSavingStorage={isSavingStorage}
              generationId={generationId}
              errorMsg={errorMsg}
              isCreditError={isCreditError}
              billingUrl={billingUrl}
              isDemo={isDemo}
              onTryDemo={handleTryDemo}
              onReset={handleResetPipeline}
            />
          </div>
        )}

        {/* 🌟 4개 비디오 카드:
            - 평상시: 화면 중앙에 10시, 2시, 8시, 4시 3D 구도로 넓직하게 배치
            - 사진 첨부 시: 화면의 4개 모서리(좌상, 우상, 좌하, 우하)로 촥 펼쳐지며 빙글빙글 회전!
        */}
        <div
          className={`w-full max-w-6xl transition-all duration-700 ${
            isPipelineActive
              ? "absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between"
              : "grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 h-full max-h-[820px] items-stretch relative z-10"
          }`}
        >
          {isPipelineActive ? (
            /* 모서리로 펼쳐졌을 때: 상단 2개 + 하단 2개 모서리 회전 뷰 */
            <div className="w-full h-full flex flex-col justify-between relative">
              {/* 상단 모서리 (10시, 2시) */}
              <div className="flex justify-between items-start">
                {/* 10시 (좌상) 모서리 스핀 카드 */}
                <div className="w-40 h-28 sm:w-56 sm:h-36 rounded-2xl overflow-hidden border border-purple-500/40 shadow-2xl opacity-60 animate-spin-slow">
                  <video
                    src="/sample1.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 2시 (우상) 모서리 스핀 카드 */}
                <div className="w-40 h-28 sm:w-56 sm:h-36 rounded-2xl overflow-hidden border border-pink-500/40 shadow-2xl opacity-60 animate-spin-reverse">
                  <video
                    src="/sample2.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* 하단 모서리 (8시, 4시) */}
              <div className="flex justify-between items-end">
                {/* 8시 (좌하) 모서리 스핀 카드 */}
                <div className="w-40 h-28 sm:w-56 sm:h-36 rounded-2xl overflow-hidden border border-amber-500/40 shadow-2xl opacity-60 animate-spin-reverse">
                  <video
                    src="/sample3.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 4시 (우하) 모서리 스핀 카드 */}
                <div className="w-40 h-28 sm:w-56 sm:h-36 rounded-2xl overflow-hidden border border-indigo-500/40 shadow-2xl opacity-60 animate-spin-slow">
                  <video
                    src="/sample4.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* 평상시: 기본 3D 구도 2x2 카드 */
            VIDEO_SLOTS.map((slot) => {
              const isHovered = hoveredCardId === slot.id;
              const hasImage = Boolean(attachedImages[slot.id]);
              const slotKey = slot.id as "baseball" | "fancam" | "audience" | "street";

              return (
                <div
                  key={slot.id}
                  onMouseEnter={() => setHoveredCardId(slot.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  onClick={() => handleCardClick(slotKey)}
                  style={{
                    transform: isHovered ? slot.hoverTransform : slot.defaultTransform,
                    transformStyle: "preserve-3d",
                    transition:
                      "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s ease",
                  }}
                  className={`relative rounded-3xl overflow-hidden cursor-pointer border border-[#27272a] shadow-2xl transition-all min-h-[220px] sm:min-h-[280px] lg:min-h-[320px] flex flex-col justify-between p-6 group ${
                    isHovered
                      ? "shadow-zinc-700/30 border-zinc-500/80 ring-1 ring-white/20"
                      : "shadow-black/70"
                  }`}
                >
                  {/* 배경 비디오 / 사진 */}
                  {hasImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={attachedImages[slot.id]}
                      alt={slot.title}
                      className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={slot.videoSrc}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105"
                    />
                  )}

                  {/* 어두운 시네마틱 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50 z-10 pointer-events-none"></div>

                  {/* 상단 뱃지 */}
                  <div className="relative z-20 flex items-center justify-start">
                    <span
                      className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md border"
                      style={{
                        backgroundColor: `${slot.accentColor}20`,
                        borderColor: `${slot.accentColor}40`,
                        color: slot.accentColor,
                      }}
                    >
                      {slot.badge}
                    </span>
                  </div>

                  {/* 호버 시 [회색 바탕 + 사진 첨부] 오버레이 */}
                  <div
                    className={`absolute inset-0 z-30 bg-[#27272a]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 transition-opacity duration-300 ${
                      isHovered ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#18181b] border border-white/20 flex items-center justify-center text-white text-2xl shadow-xl group-hover:scale-110 transition-transform">
                      📷
                    </div>
                    <div className="text-center">
                      <span className="text-base font-extrabold text-white tracking-tight block">
                        사진 첨부
                      </span>
                      <span className="text-xs text-zinc-400 mt-1 block">
                        클릭하여 내 사진 업로드
                      </span>
                    </div>
                  </div>

                  {/* 왼쪽 하단: 제목 및 Subscription */}
                  <div className="relative z-20 text-left max-w-md pt-6">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                      {slot.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-300/90 font-normal leading-relaxed mt-1.5 drop-shadow-sm line-clamp-2">
                      {slot.subscription}
                    </p>
                  </div>

                  {/* 숨겨진 파일 인풋 */}
                  <input
                    type="file"
                    ref={fileInputRefs[slotKey]}
                    onChange={(e) => handleFileChange(slot, e)}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* =================================================================
          3. 하단 안내 바
          ================================================================= */}
      <footer className="h-10 px-6 border-t border-[#27272a]/50 bg-[#09090b] flex items-center justify-between text-[11px] text-[#71717a] font-mono z-20 shrink-0">
        <span>
          {isPipelineActive
            ? "Replicate AI (google/nano-banana-pro) · 4 Corner Orbits Active"
            : "3D Tilt View Mode Active · 4 Sample Videos Loaded"}
        </span>
        <span>
          {isPipelineActive
            ? "Nano Banana Pro 2K ➡️ Firebase Storage ➡️ Firestore generations"
            : "각 영상 카드를 마우스로 가리키고 클릭하여 사진을 첨부하세요"}
        </span>
      </footer>

      {/* =================================================================
          4. 💳 토스페이먼츠 크레딧 결제 모달 (주문서형 결제 UI)
          ================================================================= */}
      <CreditPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        requiredCreditsNotice={isRequiredNotice}
      />
    </div>
  );
}
