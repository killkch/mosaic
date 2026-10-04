import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

// =================================================================
// 📌 토스페이먼츠 크레딧 상품 정의 (가격 정책)
// 10 크레딧: 4,900원 / 20 크레딧: 9,900원
// =================================================================
export interface CreditPackage {
  id: "credits_10" | "credits_20";
  name: string;
  credits: number;
  amount: number;
  badge?: string;
  description: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "credits_10",
    name: "10 크레딧",
    credits: 10,
    amount: 4900,
    description: "영상 10회 생성 가능 (회당 490원)",
  },
  {
    id: "credits_20",
    name: "20 크레딧",
    credits: 20,
    amount: 9900,
    badge: "BEST",
    description: "영상 20회 생성 가능 (회당 495원)",
  },
];

/**
 * 🔑 토스페이먼츠 클라이언트 키 (브라우저용)
 * .env.local의 NEXT_PUBLIC_TOSS_CLIENT_KEY 환경 변수를 사용합니다.
 */
export const TOSS_CLIENT_KEY =
  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ||
  "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

/**
 * 🛠️ 토스페이먼츠 V2 SDK 인스턴스 초기화 헬퍼 함수
 * @param customerKey 사용자 고유 키 (로그인 사용자 UID 또는 비회원 ANONYMOUS)
 * @returns widgets 객체 (주문서형 결제 UI 렌더링에 사용)
 */
export async function getTossWidgets(customerKey?: string) {
  if (typeof window === "undefined") {
    throw new Error("토스페이먼츠 SDK는 브라우저 환경에서만 초기화할 수 있습니다.");
  }

  // 1. 토스페이먼츠 최신 V2 SDK 로드
  const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);

  // 2. customerKey 설정: 영문/숫자/특수문자 1개 이상 포함 규칙 준수
  // 비회원일 경우 토스페이먼츠 공식 ANONYMOUS 심볼 사용
  const resolvedCustomerKey = customerKey
    ? `USER_${customerKey.replace(/[^a-zA-Z0-9-_=.@]/g, "_")}`
    : ANONYMOUS;

  // 3. 주문서형 결제 widgets 인스턴스 반환
  const widgets = tossPayments.widgets({
    customerKey: resolvedCustomerKey,
  });

  return widgets;
}
