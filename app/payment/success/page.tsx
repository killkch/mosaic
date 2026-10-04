"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

/**
 * 🎯 결제 승인 처리 내부 컴포넌트
 * successUrl로 리다이렉트된 paymentKey, orderId, amount를 받아 서버 승인 API를 호출합니다.
 */
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const isParamsInvalid = !paymentKey || !orderId || !amount;

  const [status, setStatus] = useState<"loading" | "success" | "error">(() =>
    isParamsInvalid ? "error" : "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>(() =>
    isParamsInvalid
      ? "결제 정보가 올바르지 않습니다. 필수 파라미터가 누락되었습니다."
      : ""
  );
  const [creditsAdded, setCreditsAdded] = useState<number>(0);

  const isConfirmingRef = useRef(false);

  useEffect(() => {
    if (isParamsInvalid) return;

    // ⚡ 중복 승인 요청 방지 가드
    if (isConfirmingRef.current) return;
    isConfirmingRef.current = true;

    // 🔒 서버 승인 API 호출 (토스페이먼츠 승인 + 금액 검증 + 크레딧 충전)
    async function confirmPayment() {
      try {
        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setErrorMessage(data.error || "결제 승인 처리 중 오류가 발생했습니다.");
          return;
        }

        // 🎉 승인 성공: 상태 즉시 업데이트 및 안내
        setStatus("success");
        setCreditsAdded(data.creditsAdded || 0);

        // 2.5초 후 작업 스튜디오로 자동 이동
        setTimeout(() => {
          router.push("/generate");
        }, 2500);
      } catch (err: unknown) {
        const error = err as Error;
        console.warn("결제 승인 알림:", error);
        setStatus("error");
        setErrorMessage(error.message || "결제 승인 처리에 실패했습니다.");
      }
    }

    confirmPayment();
  }, [paymentKey, orderId, amount, router, isParamsInvalid]);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex items-center justify-center p-4">
      <div className="bg-[#141416] border border-[#27272a] rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
        {status === "loading" && (
          <div className="py-8 space-y-4">
            <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">결제 승인 중입니다...</h2>
            <p className="text-xs text-zinc-400">
              토스페이먼츠 보안 서버와 통신하여 크레딧을 안전하게 충전하고 있습니다.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-6 space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto">
              ✓
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              결제 및 충전 완료!
            </h2>
            <div className="p-4 rounded-2xl bg-[#1f1f23] border border-[#2e2e33]">
              <div className="text-xs text-zinc-400">충전된 크레딧</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                +{creditsAdded} 크레딧
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                결제 금액: {Number(amount).toLocaleString()}원
              </div>
            </div>
            <p className="text-xs text-zinc-400">
              잠시 후 스튜디오로 자동 이동합니다. (3초 뒤 이동)
            </p>
            <Link
              href="/generate"
              className="inline-block w-full py-3 px-4 rounded-xl bg-white text-black font-extrabold text-sm hover:bg-zinc-200 transition-colors"
            >
              스튜디오로 바로 가기 →
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-6 space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-3xl mx-auto">
              ✕
            </div>
            <h2 className="text-xl font-black text-white">결제 승인 실패</h2>
            <p className="text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-left">
              ⚠️ {errorMessage}
            </p>
            <div className="pt-2">
              <Link
                href="/generate"
                className="inline-block w-full py-3 px-4 rounded-xl bg-zinc-800 text-white font-medium text-xs hover:bg-zinc-700 transition-colors"
              >
                스튜디오로 돌아가기
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-400 text-sm">
          결제 정보 확인 중...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
