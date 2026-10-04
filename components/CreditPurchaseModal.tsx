"use client";

import React, { useState, useEffect, useRef } from "react";
import { CREDIT_PACKAGES, CreditPackage, getTossWidgets } from "@/lib/tosspayments";
import { useAuth } from "@/context/AuthContext";

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCreditsNotice?: boolean; // 크레딧 부족으로 모달이 열렸는지 여부
}

/**
 * 💳 토스페이먼츠 V2 주문서형 결제 모달 (CreditPurchaseModal)
 * 사용자가 10크레딧(4,900원) 또는 20크레딧(9,900원)을 선택하고
 * 토스페이먼츠 결제 UI(카드/간편결제 등)를 통해 바로 결제할 수 있는 모달입니다.
 */
export default function CreditPurchaseModal({
  isOpen,
  onClose,
  requiredCreditsNotice = false,
}: CreditPurchaseModalProps) {
  const { user, userData } = useAuth();

  // 기본 선택 패키지 (20 크레딧 - 인기 상품)
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(
    CREDIT_PACKAGES[1]
  );
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 토스페이먼츠 widgets 인스턴스 보관 ref
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgetsRef = useRef<any>(null);
  const isRenderedRef = useRef(false);

  const selectedAmount = selectedPackage.amount;
  const userUid = user?.uid;

  // 모달이 열릴 때 토스페이먼츠 위젯 초기화 및 렌더링
  useEffect(() => {
    if (!isOpen) {
      isRenderedRef.current = false;
      widgetsRef.current = null;
      return;
    }

    // 이미 렌더링된 상태라면 중복 마운트 방지
    if (isRenderedRef.current) {
      return;
    }

    let isMounted = true;

    async function initWidgets() {
      try {
        setIsLoadingWidgets(true);
        setErrorMsg(null);

        // 1. 토스페이먼츠 최신 V2 SDK widgets 인스턴스 생성
        const widgets = await getTossWidgets(userUid);
        if (!isMounted) return;
        widgetsRef.current = widgets;

        // 2. 결제 금액 설정 (V2 규격: { currency: "KRW", value: number })
        await widgets.setAmount({
          currency: "KRW",
          value: selectedAmount,
        });

        // 3. 결제 수단 UI 및 이용약관 UI 렌더링
        await Promise.all([
          widgets.renderPaymentMethods({
            selector: "#toss-payment-method",
            variantKey: "DEFAULT",
          }),
          widgets.renderAgreement({
            selector: "#toss-agreement",
            variantKey: "AGREEMENT",
          }),
        ]);

        if (isMounted) {
          isRenderedRef.current = true;
          setIsLoadingWidgets(false);
        }
      } catch (err: unknown) {
        const error = err as Error;
        console.error("토스 결제위젯 초기화 오류:", error);
        if (isMounted) {
          setErrorMsg(error.message || "결제 수단 UI를 불러오지 못했습니다.");
          setIsLoadingWidgets(false);
        }
      }
    }

    // DOM 컨테이너가 마운트된 직후 초기화 진행
    const timer = setTimeout(() => {
      initWidgets();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, userUid, selectedAmount]);

  // 사용자가 상품(10크레딧/20크레딧)을 변경했을 때 위젯 금액 갱신
  const handleSelectPackage = async (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setErrorMsg(null);

    if (widgetsRef.current && isRenderedRef.current) {
      try {
        // V2의 setAmount로 변경된 금액 실시간 전달
        await widgetsRef.current.setAmount({
          currency: "KRW",
          value: pkg.amount,
        });
      } catch (err) {
        console.warn("위젯 금액 갱신 실패:", err);
      }
    }
  };

  // 🚀 결제하기 버튼 클릭 핸들러
  const handleRequestPayment = async () => {
    if (!widgetsRef.current) {
      setErrorMsg("결제 모듈이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    try {
      setIsProcessingPayment(true);
      setErrorMsg(null);

      // 1. 서버에 사전 주문 등록 (/api/payments/prepare) - 금액 위변조 방지
      const prepareRes = await fetch("/api/payments/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          userId: user?.uid || "guest",
          customerEmail: user?.email || undefined,
          customerName: user?.displayName || undefined,
        }),
      });

      const prepareData = await prepareRes.json();
      if (!prepareRes.ok) {
        throw new Error(prepareData.error || "주문 준비 중 오류가 발생했습니다.");
      }

      const { orderId, orderName } = prepareData;
      const origin = window.location.origin;

      // 2. 토스페이먼츠 공식 requestPayment 호출
      await widgetsRef.current.requestPayment({
        orderId,
        orderName,
        successUrl: `${origin}/payment/success`,
        failUrl: `${origin}/payment/fail`,
        customerEmail: user?.email || undefined,
        customerName: user?.displayName || undefined,
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.warn("결제 요청 중 오류/취소:", error);
      setErrorMsg(error.message || "결제 요청 처리 중 문제가 발생했습니다.");
      setIsProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in flex justify-center items-start p-3 sm:p-6">
      <div className="bg-[#121214] border border-[#27272a] rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col h-[88vh] max-h-[760px] my-auto overflow-hidden">
        {/* 우측 상단 닫기 버튼 */}
        <button
          onClick={onClose}
          disabled={isProcessingPayment}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-[#1e1e24] hover:bg-[#2e2e38] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 z-30"
        >
          ✕
        </button>

        {/* 1. 상단 안내 타이틀 (완전 고정 헤더, 배경 채움) */}
        <div className="p-5 sm:p-6 pb-3.5 border-b border-[#27272a]/60 bg-[#121214] shrink-0 z-20 text-left pr-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2">
            <span>🪙 크레딧 충전소</span>
            {userData && (
              <span className="text-zinc-400">· 현재 보유: {userData.credits}개</span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            영상 제작 크레딧 충전하기
          </h2>

          {requiredCreditsNotice ? (
            <p className="text-xs text-amber-400 mt-1.5 bg-amber-400/10 p-2 rounded-xl border border-amber-400/20">
              ⚠️ 영상 생성을 위한 크레딧이 부족합니다. 충전 후 바로 제작을 이어갈 수 있습니다.
            </p>
          ) : (
            <p className="text-xs text-zinc-400 mt-1">
              토스페이먼츠 간편결제로 안전하고 빠르게 크레딧을 충전하세요.
            </p>
          )}
        </div>

        {/* 2. 스크롤 가능한 본문 영역 (상품 선택 카드 + 토스 결제창) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 py-4 space-y-4 text-left custom-scrollbar">
          {/* 상품 선택 카드 목록 */}
          <div className="grid grid-cols-2 gap-3">
            {CREDIT_PACKAGES.map((pkg) => {
              const isSelected = selectedPackage.id === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => handleSelectPackage(pkg)}
                  className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[1.02]"
                      : "border-[#27272a] bg-[#18181b] hover:border-zinc-700"
                  }`}
                >
                  {pkg.badge && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider">
                      {pkg.badge}
                    </span>
                  )}
                  <div className="text-base font-bold text-white flex items-center gap-1.5">
                    <span>🪙</span> {pkg.credits} 크레딧
                  </div>
                  <div className="text-lg font-black text-emerald-400 mt-1">
                    {pkg.amount.toLocaleString()}원
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    {pkg.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 에러 메시지 알림 */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* 토스페이먼츠 위젯 로딩 안내 */}
          {isLoadingWidgets && (
            <div className="py-8 flex flex-col items-center justify-center text-zinc-400 gap-2">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">토스페이먼츠 안전 결제창 로딩 중...</span>
            </div>
          )}

          {/* 🎯 토스페이먼츠 주문서형 결제 UI 컨테이너 (결제수단 + 약관) */}
          <div className="rounded-2xl bg-[#18181b] p-2 border border-[#27272a] overflow-hidden">
            <div id="toss-payment-method" className="w-full min-h-[160px]" />
            <div id="toss-agreement" className="w-full" />
          </div>
        </div>

        {/* 3. 하단 결제하기 버튼 (완전 고정 영역, 배경 채움) */}
        <div className="p-5 sm:p-6 pt-3 border-t border-[#27272a] bg-[#121214] shrink-0 z-20">
          <button
            onClick={handleRequestPayment}
            disabled={isLoadingWidgets || isProcessingPayment}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-sm shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {isProcessingPayment ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>결제창으로 이동 중...</span>
              </>
            ) : (
              <span>
                {selectedPackage.amount.toLocaleString()}원 결제하고 {selectedPackage.credits} 크레딧 충전하기 ⚡
              </span>
            )}
          </button>
          <div className="text-center text-[10px] text-zinc-400 mt-2">
            🔒 토스페이먼츠 256비트 암호화로 보호되는 1회성 안전 결제입니다.
          </div>
        </div>
      </div>
    </div>
  );
}
