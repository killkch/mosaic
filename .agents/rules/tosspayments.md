# Toss Payments V2 연동 가이드라인 (LLM Quick Reference 준수)

본 문서는 토스페이먼츠(Toss Payments) 연동 시 반드시 준수해야 하는 핵심 아키텍처 및 보안 지침입니다.

## 1. 기본 원칙 및 버전
- **SDK 버전**: 반드시 최신 **V2 SDK** (`https://js.tosspayments.com/v2/standard`)를 사용합니다.
- **기본 결제 방식**: **주문서형 결제 (Checkout-page type)** (`widgets()` + `renderPaymentMethods()`).
- **명칭 변경 반영**: 과거 '결제위젯' → '주문서형 결제' / '결제창형 결제', '통합결제창' → '결제창(구버전)'.

## 2. 필수 보안 규칙 (Security Guardrails)
1. **시크릿 키(Secret Key) 서버 한정 보관**:
   - `test_sk_*` 또는 `live_sk_*`는 절대 `NEXT_PUBLIC_*` 등의 환경 변수에 넣지 않으며, 클라이언트 컴포넌트나 브라우저 코드에서 호출하지 않습니다.
   - 오직 서버 사이드 API 라우트 (`app/api/...`) 내부에서만 사용합니다.
2. **서버 측 결제 금액 위변조 검증 (Mandatory Amount Verification)**:
   - 브라우저 콘솔에서 클라이언트 `amount`를 조작할 수 있으므로, `successUrl`로 전달된 `amount`를 그대로 승인 API로 보내지 않습니다.
   - 반드시 서버 DB에 기록된 원래 주문 금액과 일치하는지 비교 검증한 후 `/v1/payments/confirm`을 호출합니다.
3. **인증 헤더 포맷 (Trailing Colon 필수)**:
   - `Authorization: Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')}` (시크릿 키 뒤에 `:` 콜론 반드시 포함).
4. **미확인 필드 생성 금지 (Anti-Hallucination)**:
   - 공식 문서에 없는 임의의 필드(예: 타 PG사 필드명)를 유추하여 작성하지 않습니다.

## 3. 식별자 및 데이터 타입 규칙
- **금액 (amount)**:
  - V2 클라이언트 SDK: `{ value: 50000, currency: "KRW" }` (객체)
  - 서버 승인 API: `amount: 50000` (정수)
- **customerKey**: 2~300자, 영문/숫자/특수문자(`-_=.@`) 포함 (특수문자 최소 1개 필수, UUID 권장, 비회원은 `ANONYMOUS`).
- **orderId**: 6~64자의 영문/숫자/`-_` 조합.
- **Idempotency-Key**: 중복 결제 승인 방지를 위해 UUID v4를 헤더에 포함.

## 4. 결제 완료 및 실패 처리
- **successUrl**: `paymentKey`, `orderId`, `amount` 수신 → 서버 금액 검증 → 승인 API 호출 → 결과 DB 저장.
- **failUrl**: `code`, `message`, `orderId` 수신 → 승인 API 호출 금지 → 사용자에게 친절한 에러 안내 및 재시도 제공.
