import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import crypto from "crypto";

/**
 * 🔒 [API] 토스페이먼츠 최종 결제 승인 (Confirm API)
 * 토스페이먼츠 서버에 최종 결제 승인을 요청하고, 성공 시 사용자의 크레딧을 즉시 충전합니다.
 *
 * ⚠️ 토스페이먼츠 공식 보안 규칙(LLM Quick Reference) 준수:
 * 1. Secret Key는 절대 클라이언트에 노출하지 않고 서버에서만 사용
 * 2. Authorization 헤더: Basic base64(TOSS_SECRET_KEY:) -> 끝에 콜론(:) 필수
 * 3. 서버 측 금액 위변조 검증: 전달된 amount가 DB에 저장된 주문 금액과 일치하는지 대조
 * 4. Idempotency-Key: 중복 승인 방지용 UUID v4 헤더 전송
 */
export async function POST(request: Request) {
  try {
    const { paymentKey, orderId, amount } = await request.json();

    if (!paymentKey || !orderId || amount === undefined) {
      return NextResponse.json(
        { error: "필수 결제 파라미터(paymentKey, orderId, amount)가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 1. 서버 전용 시크릿 키 확인
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "TOSS_SECRET_KEY 환경 변수가 서버에 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 2. 🛡️ [금액 위변조 검증] 사전에 저장된 주문 데이터 조회
    const orderDocRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderDocRef);

    if (!orderSnap.exists()) {
      return NextResponse.json(
        { error: "존재하지 않거나 유효하지 않은 주문 번호입니다." },
        { status: 404 }
      );
    }

    const orderData = orderSnap.data();

    // 이미 완료된 주문인지 중복 확인
    if (orderData.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        message: "이미 처리가 완료된 결제 건입니다.",
        creditsAdded: orderData.credits,
      });
    }

    // 클라이언트가 변조했을 가능성이 있는 금액과 서버 DB의 실제 금액 비교
    if (Number(orderData.amount) !== Number(amount)) {
      console.error(
        `🚨 [결제 금액 위변조 감지] DB 금액: ${orderData.amount}원, 요청 금액: ${amount}원`
      );
      return NextResponse.json(
        { error: "결제 요청 금액이 원 주문 금액과 일치하지 않습니다. (위변조 감지)" },
        { status: 400 }
      );
    }

    // 3. 토스페이먼츠 인증 헤더 생성 (Basic base64(SECRET_KEY:))
    const basicAuth = Buffer.from(`${secretKey}:`).toString("base64");

    // 4. 토스페이먼츠 공식 승인 API 호출
    console.log(`[토스페이먼츠] 결제 승인 요청 시작 - orderId: ${orderId}, amount: ${amount}`);
    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(), // 중복 결제 방지용 멱등키
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount),
      }),
    });

    const tossResult = await tossResponse.json();

    if (!tossResponse.ok) {
      // 💡 동시성 중복 호출 대응 (이미 처리 중이거나 이미 승인된 결제 요청인 경우)
      const isAlreadyProcessing =
        tossResult.code === "ALREADY_PROCESSING_PAYMENT" ||
        tossResult.code === "ALREADY_APPROVED" ||
        tossResult.message?.includes("이미 처리중인 요청") ||
        tossResult.message?.includes("이미 승인된");

      if (isAlreadyProcessing) {
        console.warn("[토스페이먼츠 안내] 이미 처리 중이거나 승인된 결제 감지 -> DB 상태 확인 후 완료 처리");
        await new Promise((r) => setTimeout(r, 600));
        const recheckSnap = await getDoc(orderDocRef);
        const recheckData = recheckSnap.data();

        if (recheckData?.status === "COMPLETED") {
          return NextResponse.json({
            success: true,
            message: "이미 처리가 완료된 결제 건입니다.",
            creditsAdded: recheckData.credits,
            orderId,
          });
        }
      }

      console.error("[토스페이먼츠 승인 실패]:", tossResult);
      return NextResponse.json(
        {
          error: tossResult.message || "토스페이먼츠 승인 요청이 거절되었습니다.",
          code: tossResult.code,
        },
        { status: tossResponse.status }
      );
    }

    // 5. 🪙 [크레딧 충전] 사용자의 users 문서 credits 원자적(atomic) 증가
    const userId = orderData.userId;
    const purchasedCredits = Number(orderData.credits) || 0;

    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      credits: increment(purchasedCredits),
      lastPaymentAt: serverTimestamp(),
    });

    // 6. 📝 주문 상태 완료 처리
    await updateDoc(orderDocRef, {
      status: "COMPLETED",
      paymentKey,
      approvedAt: tossResult.approvedAt || new Date().toISOString(),
    });

    // 7. 🗄️ Firestore 'payments' 컬렉션에 상세 결제 거래 기록 영구 보관
    await setDoc(doc(db, "payments", orderId), {
      orderId,
      paymentKey,
      userId,
      amount: Number(amount),
      credits: purchasedCredits,
      orderName: orderData.orderName,
      method: tossResult.method || "간편결제",
      status: "DONE",
      approvedAt: tossResult.approvedAt || new Date().toISOString(),
      receiptUrl: tossResult.receipt?.url || null,
      createdAt: serverTimestamp(),
    });

    console.log(
      `🎉 [크레딧 충전 완료] 사용자: ${userId}, 충전 크레딧: +${purchasedCredits}개, 결제금액: ${amount}원`
    );

    return NextResponse.json({
      success: true,
      message: `${purchasedCredits} 크레딧이 성공적으로 충전되었습니다.`,
      creditsAdded: purchasedCredits,
      orderId,
      receiptUrl: tossResult.receipt?.url,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[결제 승인 내부 오류]:", err.message || err);
    return NextResponse.json(
      { error: err.message || "결제 승인 처리 중 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
