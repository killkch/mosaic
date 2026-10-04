"use client";

import React from "react";

interface GenerationPipelineProps {
  categoryTitle: string;
  originalImage: string; // 사용자가 첨부한 원본 사진
  generatedImage: string | null; // Replicate 생성 이미지 URL
  isGenerating: boolean; // 생성 진행 중 여부
  errorMsg: string | null;
  isCreditError?: boolean; // 402 크레딧 부족 여부
  billingUrl?: string; // Replicate 결제 충전 링크
  onReset: () => void; // 다시 첨부하기
  onTryDemo?: () => void; // 데모 모드로 파이프라인 계속 진행
  generationId?: string | null; // Firestore generations 테이블에 기록된 ID
  isSavingStorage?: boolean; // Firebase Storage 저장 중 여부
  isDemo?: boolean; // 데모 모드로 생성되었는지 여부
}

export function GenerationPipeline({
  categoryTitle,
  originalImage,
  generatedImage,
  isGenerating,
  errorMsg,
  isCreditError,
  billingUrl,
  onReset,
  onTryDemo,
  generationId,
  isSavingStorage,
  isDemo,
}: GenerationPipelineProps) {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#141416]/95 border border-[#27272a] shadow-2xl backdrop-blur-xl z-20 animate-fade-in text-left">
      {/* 상단 파이프라인 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#27272a] gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">
              AI Generation Pipeline
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
              {categoryTitle}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
              🍌 Nano Banana Pro
            </span>
            {isDemo && (
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                ⚡ DEMO MODE
              </span>
            )}
            {generationId && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ✓ Firestore generations 연동 완료
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
            원클릭 바이럴 영상 생성 진행 단계
          </h2>
        </div>

        <button
          onClick={onReset}
          className="self-start sm:self-auto text-xs px-3.5 py-1.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
        >
          다른 사진 첨부하기
        </button>
      </div>

      {/* ⚠️ 에러 발생 시 안내 카드 (402 크레딧 부족 시 상세 안내 및 충전 버튼 제공) */}
      {errorMsg && (
        <div className="mt-5 p-4 rounded-2xl bg-[#ff5a5a]/15 border border-[#ff5a5a]/40 text-[#ff5a5a] text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-sm">
              <span>⚠️</span>
              <span>
                {isCreditError
                  ? "Replicate API 크레딧(Credit) 부족 안내"
                  : "이미지 생성 실패"}
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">{errorMsg}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isCreditError && billingUrl && (
              <a
                href={billingUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#ff5a5a] hover:bg-[#ff4040] text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
              >
                <span>Replicate 크레딧 충전하기</span>
                <span className="text-[10px]">↗</span>
              </a>
            )}
            {onTryDemo && (
              <button
                type="button"
                onClick={onTryDemo}
                className="px-3.5 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                데모로 파이프라인 확인하기 ✨
              </button>
            )}
            <button
              onClick={onReset}
              className="px-3 py-2 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-zinc-300 text-xs transition-colors cursor-pointer border border-[#27272a]"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* =================================================================
          🌟 3단계 시각화 카드: [첨부한 사진] -> [생성된 이미지] -> [생성된 영상]
          ================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 items-stretch">
        {/* -------------------------------------------------------------
            [1단계: 사용자가 첨부한 사진]
            ------------------------------------------------------------- */}
        <div className="flex flex-col rounded-2xl bg-[#18181b] border border-[#27272a] overflow-hidden p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[10px]">
                1
              </span>
              첨부한 사진
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              업로드 완료
            </span>
          </div>

          <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-black border border-[#27272a] shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalImage}
              alt="첨부한 원본 사진"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-[10px] text-zinc-300 font-mono">
              Original Input
            </div>
          </div>

          <p className="text-[11px] text-[#71717a] mt-3 leading-relaxed">
            사용자가 업로드한 원본 인물 및 구도 사진입니다.
          </p>
        </div>

        {/* -------------------------------------------------------------
            [2단계: Replicate google/nano-banana-pro 생성된 이미지]
            ------------------------------------------------------------- */}
        <div className="flex flex-col rounded-2xl bg-[#18181b] border border-purple-500/30 shadow-lg shadow-purple-950/20 overflow-hidden p-4 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              생성된 이미지
            </span>
            {isGenerating ? (
              <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30 animate-pulse">
                Nano Banana Pro 생성 중...
              </span>
            ) : generatedImage ? (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {isSavingStorage ? "Storage 저장 중..." : "Storage 저장 완료"}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-zinc-500">대기 중</span>
            )}
          </div>

          <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-black border border-[#27272a] flex items-center justify-center">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                <div className="text-xs font-bold text-purple-300">
                  AI 바이럴 이미지 렌더링 중
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  google/nano-banana-pro 2K 구동 중...
                </div>
              </div>
            ) : generatedImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={generatedImage}
                  alt="AI 생성된 이미지"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-[10px] text-purple-300 font-mono flex items-center gap-1">
                  <span>Nano Banana Pro 🍌</span>
                </div>
              </>
            ) : (
              <div className="text-xs text-zinc-600 font-mono">생성 대기 중</div>
            )}
          </div>

          <p className="text-[11px] text-[#71717a] mt-3 leading-relaxed">
            Google Nano Banana Pro가 9:16 비율 2K 해상도로 합성한 바이럴 이미지입니다.
          </p>
        </div>

        {/* -------------------------------------------------------------
            [3단계: 생성된 영상 (숏폼 비디오)]
            ------------------------------------------------------------- */}
        <div className="flex flex-col rounded-2xl bg-[#18181b] border border-[#27272a] overflow-hidden p-4 opacity-80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-zinc-700 text-white flex items-center justify-center text-[10px]">
                3
              </span>
              생성된 영상
            </span>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
              다음 단계 준비 중
            </span>
          </div>

          <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-zinc-950 border border-dashed border-[#27272a] flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl text-zinc-500">
              🎬
            </div>
            <div className="text-xs font-bold text-zinc-300">
              바이럴 숏폼 비디오
            </div>
            <div className="text-[10px] text-zinc-500 leading-tight">
              생성된 이미지를 기반으로 60초 숏폼 모션 비디오가 합성될 예정입니다.
            </div>
          </div>

          <p className="text-[11px] text-[#71717a] mt-3 leading-relaxed">
            자막, AI 보이스, 배경음악이 결합된 최종 숏폼 영상 단계입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
