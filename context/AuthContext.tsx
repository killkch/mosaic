"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// =================================================================
// 📌 Firestore users 컬렉션에 저장되는 사용자 프로필 모델
// =================================================================
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  credits: number;           // 남은 바이럴 영상 제작 크레딧
  provider?: string;         // 가입 제공업체 (password 또는 google.com)
  createdAt?: unknown;
  lastLoginAt?: unknown;
  lastPaymentAt?: unknown;
}

// =================================================================
// 📌 AuthContext 타입 정의
// =================================================================
interface AuthContextType {
  user: User | null;                         // Firebase Auth 원본 사용자 객체
  userData: UserProfile | null;              // Firestore users 컬렉션에 저장된 사용자 상세 정보
  loading: boolean;                          // 세션 로딩 상태
  login: (email: string, pass: string) => Promise<void>;    // 이메일/비밀번호 로그인
  signup: (email: string, pass: string) => Promise<void>;   // 신규 회원가입
  loginWithGoogle: () => Promise<void>;      // 구글 소셜 로그인
  logout: () => Promise<void>;               // 로그아웃
  deductCredit: (amount?: number) => Promise<boolean>;      // 영상 생성 시 크레딧 차감
}

// React Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 🛡️ AuthProvider 컴포넌트
 * 애플리케이션 전체에 Firebase 인증 상태 및 Firestore 사용자 프로필을 공급하는 전역 래퍼입니다.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 💾 Firestore users 컬렉션 초기 사용자 등록/로그인 시간 최신화
   */
  const syncUserToFirestore = async (firebaseUser: User) => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        // ✨ [처음 방문한 사용자] 신규 등록 (기본 무료 크레딧 3개 지급)
        const newProfileData: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName:
            firebaseUser.displayName ||
            (firebaseUser.email ? firebaseUser.email.split("@")[0] : "크리에이터"),
          photoURL: firebaseUser.photoURL || null,
          credits: 3, // 신규 가입자 3회 무료 영상 제작 크레딧
          provider: firebaseUser.providerData[0]?.providerId || "password",
        };

        await setDoc(userDocRef, {
          ...newProfileData,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
      } else {
        // 🔄 [기존 사용자] 로그인 시간 최신화
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Firestore users 컬렉션 동기화 중 오류 발생:", error);
    }
  };

  // 컴포넌트 마운트 시 Firebase의 로그인 상태 리스너 및 Firestore 실시간 크레딧 리스너 등록
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // 1. 초기 사용자 확인 및 등록
        await syncUserToFirestore(currentUser);

        // 2. ⚡ Firestore users/{uid} 실시간 구독 (onSnapshot)
        // 결제 충전이나 크레딧 차감 시 새로고침 없이 화면의 크레딧 숫자가 즉각 바뀝니다!
        const userDocRef = doc(db, "users", currentUser.uid);
        unsubscribeFirestore = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUserData({
                uid: data.uid,
                email: data.email,
                displayName: data.displayName,
                photoURL: data.photoURL,
                credits: typeof data.credits === "number" ? data.credits : 0,
                provider: data.provider,
                createdAt: data.createdAt,
                lastLoginAt: data.lastLoginAt,
                lastPaymentAt: data.lastPaymentAt,
              });
            }
          },
          (err) => {
            console.error("사용자 크레딧 실시간 구독 오류:", err);
          }
        );
      } else {
        setUserData(null);
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }
      }

      setLoading(false);
    });

    // 컴포넌트 언마운트 시 리스너 해제 (메모리 누수 방지)
    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  // 1. 이메일/비밀번호 로그인 함수
  const login = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await syncUserToFirestore(cred.user);
  };

  // 2. 신규 계정 회원가입 함수
  const signup = async (email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await syncUserToFirestore(cred.user);
  };

  // 3. 구글 소셜 로그인 함수 (팝업 방식)
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    const cred = await signInWithPopup(auth, provider);
    await syncUserToFirestore(cred.user);
  };

  // 4. 로그아웃 함수
  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  // 5. 🪙 영상 제작 시 1 크레딧 원자적 차감 함수
  const deductCredit = async (amount: number = 1): Promise<boolean> => {
    if (!user) {
      console.warn("로그인하지 않은 사용자는 크레딧을 차감할 수 없습니다.");
      return false;
    }

    if (!userData || userData.credits < amount) {
      console.warn("잔여 크레딧이 부족합니다.");
      return false;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        credits: increment(-amount),
      });
      return true;
    } catch (err) {
      console.error("크레딧 차감 실패:", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        deductCredit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 💡 useAuth 커스텀 훅
 * 모든 컴포넌트에서 간편하게 user, userData(크레딧 등) 정보 및 로그인/로그아웃/크레딧 차감 함수를 불러올 수 있습니다.
 * 예: const { user, userData, deductCredit } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 반드시 AuthProvider 내부에서 사용되어야 합니다.");
  }
  return context;
}
