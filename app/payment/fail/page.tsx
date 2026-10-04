"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * ❌ 결제 실패/취소 안내 내부 컴포넌트
 * failUrl로 리다이렉트된 code, message를 받아 사용자에게 안내합니다.
 * 토스페이먼츠 공식 가이드: failUrl에서는 절대 승인(confirm) API를 호출하지 않습니다.
 */
function PaymentFailContent() {
  const searchParams = useSearchParams();

  const code = searchParams.get("code") || "PAYMENT_CANCELLED";
  const message =
    searchParams.get("message") || "결제가 취소되었거나 진행 중 문제가 발생했습니다.";
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex items-center justify-center p-4">
      <div className="bg-[#141416] border border-[#27272a] rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto">
          !
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">
          결제가 완료되지 않았습니다
        </h2>

        <div className="p-4 rounded-2xl bg-[#1a1a1e] border border-[#27272a] text-left space-y-2">
          <div className="text-xs text-zinc-400">오류 메시지</div>
          <div className="text-sm font-medium text-white">{message}</div>
          <div className="text-[11px] text-zinc-400 font-mono pt-1 border-t border-[#27272a]">
            오류 코드: {code} {orderId ? `| 주문번호: ${orderId}` : ""}
          </div>
        </div>

        <p className="text-xs text-zinc-400">
          결제 도중 창을 닫았거나 카드사 오류 등으로 결제가 정상 처리되지 않았습니다. 필요하신 경우 다시 시도해주세요.
        </p>

        <div className="pt-2">
          <Link
            href="/generate"
            className="inline-block w-full py-3.5 px-4 rounded-xl bg-white text-black font-extrabold text-sm hover:bg-zinc-200 transition-colors"
          >
            스튜디오로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-400 text-sm">
          결제 상태 확인 중...
        </div>
      }
    >
      <PaymentFailContent />
    </Suspense>
  );
}
