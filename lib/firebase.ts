import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * 🔒 Firebase 웹 설정 (Environment Variables)
 * .env.local 파일에 정의된 환경 변수들을 안전하게 불러옵니다.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * ⚡ Next.js(SSR & Hot Reloading) 환경에서의 안전한 초기화
 * 이미 초기화된 Firebase 앱이 있다면 기존 인스턴스(getApp())를 재사용하고,
 * 아직 초기화되지 않았다면 새로 initializeApp()을 호출하여 중복 초기화 경고를 방지합니다.
 */
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * 👤 Firebase 인증(Authentication) 인스턴스
 * 이메일/비밀번호, Google 로그인, 세션 상태 추적 시 사용됩니다.
 */
export const auth = getAuth(app);

/**
 * 💾 Firestore Database 인스턴스
 * users 컬렉션 및 영상 메타데이터 저장 시 사용됩니다.
 */
export const db = getFirestore(app);

export default app;
