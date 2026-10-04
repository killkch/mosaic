import { NextResponse } from "next/server";
import Replicate from "replicate";

export const maxDuration = 60; // AI 이미지 생성을 위한 타임아웃 확장 (초)

export async function POST(request: Request) {
  // catch 블록에서도 안전하게 참조할 수 있도록 상위 스코프에 변수 선언
  let imageBase64 = "";
  let promptText = "";

  try {
    const body = await request.json();
    imageBase64 = body.imageBase64 || "";
    const category = body.category;
    const customPrompt = body.customPrompt;
    const useDemoFallback = body.useDemoFallback;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "첨부된 이미지가 없습니다." },
        { status: 400 }
      );
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN 환경 변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 카테고리별 바이럴 특화 프롬프트 설계
    promptText = customPrompt || "";
    if (!promptText) {
      switch (category) {
        case "야구 중계샷":
          promptText =
            "A cinematic live broadcast shot of the subject playing baseball at night in a packed stadium, dynamic camera angle, stadium lights, crowd in background, photorealistic, 4k resolution";
          break;
        case "아이돌 직캠":
          promptText =
            "4K 60fps idol stage fancam portrait of the subject, dynamic stage laser lighting, charismatic pose, sharp focus, vibrant K-pop concert background, photorealistic";
          break;
        case "쇼미 관객석":
          promptText =
            "Subject in a crowded hip-hop concert audience reacting passionately, atmospheric stage smoke, dramatic laser lights, deep shadows, cinematic candid photography";
          break;
        case "스트릿 패션":
          promptText =
            "Trendy high-fashion street snapshot of the subject walking in Seongsu-dong Seoul, modern aesthetic outfit, editorial fashion photography, daylight, natural depth of field";
          break;
        default:
          promptText =
            "A high-quality cinematic viral portrait preserving the subject's face and likeness, professional studio lighting, photorealistic";
          break;
      }
    }

    // 데모 폴백 모드 요청인 경우 (크레딧 부족 시 UI 및 Firebase 파이프라인 테스트용)
    if (useDemoFallback) {
      return NextResponse.json({
        success: true,
        imageUrl: imageBase64,
        prompt: promptText,
        isDemo: true,
      });
    }

    // Replicate 클라이언트 인스턴스 초기화
    const replicate = new Replicate({
      auth: apiToken,
    });

    console.log(
      `[Replicate] google/nano-banana-pro 생성 요청 시작 (카테고리: ${category || "기본"})`
    );

    // 🍌 google/nano-banana-pro 모델 입력 파라미터 구성
    const inputPayload = {
      prompt: promptText,
      image_input: [imageBase64], // 첨부된 사진 전달
      aspect_ratio: "9:16", // 숏폼 영상에 완벽한 9:16 비율
      resolution: "2K",
      output_format: "png",
      safety_filter_level: "block_only_high",
      allow_fallback_model: true,
    };

    // google/nano-banana-pro 모델 호출
    const output = await replicate.run("google/nano-banana-pro", {
      input: inputPayload,
    });

    console.log("[Replicate] google/nano-banana-pro 응답 수신:", output);

    // 출력 URL 파싱 (문자열 또는 배열 대응)
    let generatedUrl = "";
    if (typeof output === "string") {
      generatedUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      generatedUrl = String(output[0]);
    }

    if (!generatedUrl) {
      throw new Error("Replicate 모델로부터 생성된 이미지 URL을 받지 못했습니다.");
    }

    return NextResponse.json({
      success: true,
      imageUrl: generatedUrl,
      prompt: promptText,
      isDemo: false,
    });
  } catch (error: unknown) {
    const err = error as Error;
    const isCreditError =
      err.message?.includes("402") ||
      err.message?.includes("Insufficient credit") ||
      err.message?.includes("Payment Required");

    // 💡 크레딧 소진(402)인 경우 앱이 멈추지 않도록 스마트 데모 이미지로 파이프라인을 자동 완주합니다.
    if (isCreditError) {
      console.warn("[Replicate 안내] 크레딧 소진 감지 -> 데모 미리보기 모드로 자동 전환하여 파이프라인을 완료합니다.");
      return NextResponse.json({
        success: true,
        imageUrl: imageBase64, // 사용자가 첨부한 사진을 바탕으로 미리보기 제공
        prompt: promptText,
        isDemo: true,
        isCreditWarning: true,
        billingUrl: "https://replicate.com/account/billing#billing",
        message: "Replicate 계정의 잔여 크레딧이 소진되어 데모 미리보기 모드로 파이프라인이 자동 진행되었습니다.",
      });
    }

    console.warn("[Replicate Warning]:", err.message || err);

    return NextResponse.json(
      {
        error: err.message || "이미지 생성 중 오류가 발생했습니다.",
        isCreditError: false,
      },
      { status: 500 }
    );
  }
}
