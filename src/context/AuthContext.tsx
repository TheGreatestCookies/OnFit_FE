import React, { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { login as apiLogin } from '@/apis/auth/login';
import { logout as apiLogout } from '@/apis/auth/logout';
import { signup as apiSignup } from '@/apis/member/signup';
import type { UserInfo } from '@/types/UserType';
import { getUserInfo } from '@/apis/user/getUserInfo';

/**
 * AuthContext
 * 인증 관련 상태와 메서드를 제공합니다.
 * 세션 기반 인증을 사용하며, userInfo의 유무로 로그인 상태를 판단합니다.
 */
interface AuthContextType {
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
  isLoggedIn: boolean;
  isInitialized: boolean;
  clearAuth: () => void;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 반드시 AuthProvider 내에서 사용되어야 함');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();

  const { data: userInfo, isLoading } = useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      try {
        const response = await getUserInfo();
        console.log('React Query getUserInfo response:', response);
        return response?.data || null;
      } catch (error) {
        console.error('React Query getUserInfo error:', error);
        return null;
      }
    },
    staleTime: Infinity, // 사용자 정보는 자주 변하지 않으므로 길게 설정
    retry: 0,
  });

  const setUserInfo = (newUserInfo: UserInfo | null) => {
    queryClient.setQueryData(['userInfo'], newUserInfo);
  };

  const clearAuth = () => {
    queryClient.setQueryData(['userInfo'], null);
  };

  const login = async (data: any) => {
    console.log('🔐 Login started');
    await apiLogin(data);
    console.log('✅ Login API success');
    // 로그인 성공 후 사용자 정보를 다시 가져오기
    const response = await getUserInfo();
    console.log('📥 getUserInfo response:', response);
    const newUserInfo = response?.data || null;
    console.log('👤 Setting userInfo:', newUserInfo);
    setUserInfo(newUserInfo);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      clearAuth();
    }
  };

  const signup = async (data: any) => {
    await apiSignup(data);
  };

  const isLoggedIn = !!userInfo;
  const isInitialized = !isLoading;

  console.log('🔍 isLoggedIn:', isLoggedIn);
  console.log('🔍 isInitialized:', isInitialized);
  console.log('🔍 userInfo:', userInfo);

  const value: AuthContextType = {
    isLoggedIn,
    isInitialized,
    clearAuth,
    userInfo: userInfo || null,
    setUserInfo,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
