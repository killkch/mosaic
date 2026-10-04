"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: React.CSSProperties;
}

export const WordsPullUp = ({
  text,
  className = "",
  showAsterisk = false,
  style,
}: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block relative"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ---------------- WordsPullUpMultiStyle ---------------- */
interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  style?: React.CSSProperties;
}

export const WordsPullUpMultiStyle = ({
  segments,
  className = "",
  style,
}: WordsPullUpMultiStyleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const words: { word: string; className?: string }[] = [];
  segments.forEach((seg) => {
    seg.text.split(" ").forEach((w) => {
      if (w) words.push({ word: w, className: seg.className });
    });
  });

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block ${w.className ?? ""}`}
          style={{ marginRight: "0.25em" }}
        >
          {w.word}
        </motion.span>
      ))}
    </div>
  );
};

/* ---------------- PrismaHero (MOSAIC 맞춤 컴포넌트) ---------------- */
export const PrismaHero = () => {
  return (
    <div className="relative h-full min-h-[85vh] w-full overflow-hidden rounded-2xl md:rounded-[2.5rem] border border-[#27272a]/60 shadow-2xl bg-black">
      {/* 1. 배경 고화질 시네마틱 비디오 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
      />

      {/* 2. 필름 노이즈 텍스처 오버레이 */}
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.4] mix-blend-overlay" />

      {/* 3. 시네마틱 다크 그라디언트 오버레이 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/85" />

      {/* 4. Hero 본문 콘텐츠 (하단 텍스트 및 시작 버튼) */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 sm:px-8 sm:pb-8 md:px-12 md:pb-12 z-10">
        <div className="grid grid-cols-12 items-end gap-6">
          {/* 좌측: 대형 타이포그래피 (MOSAIC) */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-8">
            <h1
              className="font-black leading-[0.85] tracking-[-0.06em] text-[18vw] sm:text-[16.5vw] md:text-[15vw] lg:text-[13vw] xl:text-[12vw] select-none"
              style={{ color: "#E1E0CC" }}
            >
              <WordsPullUp text="MOSAIC" showAsterisk />
            </h1>
          </div>

          {/* 우측: 서비스 설명 및 스튜디오 바로가기 CTA 버튼 */}
          <div className="col-span-12 flex flex-col gap-5 pb-2 lg:col-span-5 xl:col-span-4 lg:pb-4 text-left">
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs sm:text-sm md:text-base font-normal tracking-tight text-[#E1E0CC]/80"
              style={{ lineHeight: 1.5 }}
            >
              단 한 장의 사진으로 야구 중계석, 아이돌 직캠, 힙합 무대까지. 당신의 이야기를 시네마틱한 바이럴 숏폼 영상으로 완성하는 차세대 AI 크리에이티브 스튜디오입니다.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href="/generate"
                className="group inline-flex items-center gap-3 self-start rounded-full bg-[#E1E0CC] hover:bg-white py-1.5 pl-6 pr-1.5 text-sm sm:text-base font-bold text-black transition-all hover:gap-4 shadow-xl active:scale-95 cursor-pointer"
              >
                <span>스튜디오 시작하기</span>
                <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-105">
                  <ArrowRight className="h-4 w-4 text-[#E1E0CC]" />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
