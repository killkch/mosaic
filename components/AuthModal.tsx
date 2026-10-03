"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  // 모드: "login" (로그인) 또는 "signup" (회원가입)
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const { login, signup, loginWithGoogle } = useAuth();

  if (!isOpen) return null;

  // Firebase 에러 코드를 친절한 한국어 안내문으로 변환하는 헬퍼 함수
  const getKoreanErrorMessage = (code: string): string => {
    switch (code) {
      case "auth/invalid-email":
        return "올바른 이메일 주소 형식이 아닙니다.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "이메일 또는 비밀번호가 일치하지 않습니다.";
      case "auth/email-already-in-use":
        return "이미 가입되어 있는 이메일 주소입니다.";
      case "auth/weak-password":
        return "비밀번호는 최소 6자 이상이어야 합니다.";
      case "auth/too-many-requests":
        return "접속 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.";
      case "auth/operation-not-allowed":
        return "Firebase 콘솔에서 해당 로그인 방식(이메일 또는 Google)이 아직 활성화되지 않았습니다.";
      case "auth/popup-blocked":
        return "브라우저에서 팝업이 차단되었습니다. 팝업 허용 후 다시 시도해 주세요.";
      case "auth/popup-closed-by-user":
        return "로그인 창이 닫혔습니다.";
      case "auth/cancelled-popup-request":
        return "이전 로그인 요청이 진행 중입니다.";
      default:
        return "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    }
  };

  // 1. Google 소셜 로그인 핸들러
  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      // 로그인 성공 시 모달 닫기
      onClose();
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      // 사용자가 팝업을 직접 닫은 경우 에러 메시지를 띄우지 않고 자연스럽게 종료
      if (firebaseError.code === "auth/popup-closed-by-user") {
        return;
      }
      setErrorMsg(getKoreanErrorMessage(firebaseError.code || ""));
    } finally {
      setGoogleSubmitting(false);
    }
  };

  // 2. 이메일/비밀번호 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // 유효성 검사
    if (!email.trim() || !password.trim()) {
      setErrorMsg("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setErrorMsg("비밀번호는 최소 6자 이상 입력해야 합니다.");
        return;
      }
      if (password !== passwordConfirm) {
        setErrorMsg("비밀번호와 비밀번호 확인이 서로 일치하지 않습니다.");
        return;
      }
    }

    try {
      setSubmitting(true);
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      // 성공 시 모달 닫기 및 폼 초기화
      onClose();
      setEmail("");
      setPassword("");
      setPasswordConfirm("");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      setErrorMsg(getKoreanErrorMessage(firebaseError.code || ""));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#141416] border border-[#27272a] p-6 sm:p-8 shadow-2xl text-left">
        {/* 상단 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#71717a] hover:text-white transition-colors text-lg cursor-pointer"
          aria-label="닫기"
        >
          ✕
        </button>

        {/* 상단 타이틀 */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-[#a1a1aa] text-[11px] font-mono mb-2">
            <span>Graphite Auth · Google & Email</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {mode === "login" ? "Mosaic AI 로그인" : "신규 계정 만들기"}
          </h2>
          <p className="text-xs text-[#71717a] mt-1">
            {mode === "login"
              ? "간편하게 로그인하여 나만의 바이럴 영상을 만들어보세요."
              : "간단한 등록으로 3회 무료 영상 크레딧을 즉시 받으세요."}
          </p>
        </div>

        {/* 에러 메시지 뱃지 (코랄 레드 포인트) */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#ff5a5a]/15 border border-[#ff5a5a]/40 text-[#ff5a5a] text-xs flex items-center gap-2">
            <span className="font-bold">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 🌟 구글 소셜 로그인 버튼 (Graphite Mono 스타일) */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleSubmitting || submitting}
          className="w-full py-3 px-4 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-white font-medium text-sm transition-all flex items-center justify-center gap-3 active:scale-95 cursor-pointer disabled:opacity-50 shadow-sm"
        >
          {googleSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Google 연결 중...</span>
            </>
          ) : (
            <>
              {/* 공식 4색 Google 'G' 로고 SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google 계정으로 계속하기</span>
            </>
          )}
        </button>

        {/* ── 또는 구분선 ── */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#27272a]"></div>
          </div>
          <span className="relative bg-[#141416] px-3 text-[11px] font-mono text-[#71717a]">
            또는 이메일로 계속하기
          </span>
        </div>

        {/* 이메일 / 비밀번호 폼 입력창 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#a1a1aa] mb-1.5">
              이메일 주소
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#52525b] focus:outline-none focus:border-zinc-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#a1a1aa] mb-1.5">
              비밀번호 {mode === "signup" && "(6자 이상)"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#52525b] focus:outline-none focus:border-zinc-400 transition-colors"
              required
            />
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-xs font-mono text-[#a1a1aa] mb-1.5">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#52525b] focus:outline-none focus:border-zinc-400 transition-colors"
                required
              />
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={submitting || googleSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-[#e4e4e7] transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer shadow-sm"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>처리 중...</span>
              </>
            ) : mode === "login" ? (
              "이메일로 로그인"
            ) : (
              "무료 회원가입 완료"
            )}
          </button>
        </form>

        {/* 하단 로그인/회원가입 모드 전환 */}
        <div className="mt-6 pt-4 border-t border-[#27272a] text-center text-xs text-[#71717a]">
          {mode === "login" ? (
            <p>
              아직 계정이 없으신가요?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg("");
                }}
                className="text-white font-medium underline ml-1 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                회원가입하기
              </button>
            </p>
          ) : (
            <p>
              이미 계정이 있으신가요?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg("");
                }}
                className="text-white font-medium underline ml-1 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                로그인하기
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
