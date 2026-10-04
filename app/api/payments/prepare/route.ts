import { NextResponse } from "next/server";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CREDIT_PACKAGES } from "@/lib/tosspayments";

/**
 * 🛡️ [API] 결제 사전 주문 등록 (위변조 방지)
 * 사용자가 결제 버튼을 누르기 전, 결제할 패키지 정보와 금액을 서버 DB(Firestore)에 안전하게 기록합니다.
 * 나중에 토스페이먼츠 승인(confirm) 시 이 데이터와 대조하여 금액 변조를 원천 차단합니다.
 */
export async function POST(request: Request) {
  try {
    const { packageId, userId, customerEmail, customerName } = await request.json();

    if (!packageId || !userId) {
      return NextResponse.json(
        { error: "필수 파라미터(packageId, userId)가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 1. 유효한 패키지인지 서버 정책과 대조 확인
    const selectedPackage = CREDIT_PACKAGES.find((pkg) => pkg.id === packageId);
    if (!selectedPackage) {
      return NextResponse.json(
        { error: "유효하지 않은 크레딧 상품입니다." },
        { status: 400 }
      );
    }

    // 2. 토스페이먼츠 규격에 맞는 고유 주문 번호(orderId) 생성 (6~64자의 영문/숫자/-_)
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const orderName = `MOSAIC 크레딧 ${selectedPackage.credits}개 충전`;

    // 3. Firestore 'orders' 컬렉션에 주문 정보 임시 저장 (상태: PENDING)
    await setDoc(doc(db, "orders", orderId), {
      orderId,
      userId,
      packageId: selectedPackage.id,
      credits: selectedPackage.credits,
      amount: selectedPackage.amount,
      orderName,
      customerEmail: customerEmail || null,
      customerName: customerName || null,
      status: "PENDING",
      createdAt: serverTimestamp(),
    });

    // 4. 클라이언트에게 검증된 orderId 및 금액 반환
    return NextResponse.json({
      success: true,
      orderId,
      orderName,
      amount: selectedPackage.amount,
      credits: selectedPackage.credits,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[주문 사전 등록 오류]:", err.message || err);
    return NextResponse.json(
      { error: "주문 정보 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
