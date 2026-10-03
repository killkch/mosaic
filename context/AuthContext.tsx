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
   * 💾 Firestore users 컬렉션 사용자 정보 동기화 함수
   * 사용자가 로그인했을 때 Firestore를 확인하여:
   * 1) 처음 방문한 사용자라면 -> users 컬렉션에 새 문서를 만들고 3회 무료 크레딧 지급
   * 2) 이미 존재하는 사용자라면 -> lastLoginAt 시간을 최신화하고 정보 로드
   */
  const syncUserToFirestore = async (firebaseUser: User) => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        // ✨ [처음 방문한 사용자] 신규 등록
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

        // Firestore에 타임스탬프와 함께 저장
        await setDoc(userDocRef, {
          ...newProfileData,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });

        setUserData(newProfileData);
      } else {
        // 🔄 [기존 사용자] 로그인 시간 최신화 및 기존 정보 불러오기
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp(),
        });

        const existingData = userSnap.data();
        setUserData({
          uid: existingData.uid,
          email: existingData.email,
          displayName: existingData.displayName,
          photoURL: existingData.photoURL,
          credits: existingData.credits ?? 3,
          provider: existingData.provider,
        });
      }
    } catch (error) {
      console.error("Firestore users 컬렉션 동기화 중 오류 발생:", error);
    }
  };

  // 컴포넌트 마운트 시 Firebase의 로그인 상태 변화 리스너 등록
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // 로그인 성공 시 Firestore users 컬렉션 동기화 실행
        await syncUserToFirestore(currentUser);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    // 컴포넌트 언마운트 시 리스너 해제 (메모리 누수 방지)
    return () => unsubscribe();
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

  return (
    <AuthContext.Provider
      value={{ user, userData, loading, login, signup, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 💡 useAuth 커스텀 훅
 * 모든 컴포넌트에서 간편하게 user, userData(크레딧 등) 정보 및 로그인/로그아웃 함수를 불러올 수 있습니다.
 * 예: const { user, userData, login, loginWithGoogle, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 반드시 AuthProvider 내부에서 사용되어야 합니다.");
  }
  return context;
}
