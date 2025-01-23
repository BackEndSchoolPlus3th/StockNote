import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// 커스텀 훅
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // OAuth2 로그인 후 토큰 처리 함수
  const handleOAuth2Login = async () => {
    try {
      // URL에서 accessToken 파싱
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('accessToken');

      if (accessToken) {
        // 토큰 로컬 스토리지 저장
        localStorage.setItem('accessToken', accessToken);

        // 사용자 프로필 가져오기
        const response = await axios.get('http://localhost:8090/api/user/profile', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        // 사용자 정보 설정
        setUser(response.data.data);
        setIsAuthenticated(true);

        // URL에서 토큰 제거
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('OAuth2 로그인 처리 중 오류:', error);
      localStorage.removeItem('accessToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };


  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  // 마운트 시 OAuth2 로그인 처리 및 토큰 검증
  const loadUserProfile = async () => {
    try {
      const savedToken = localStorage.getItem('accessToken');
      if (!savedToken) return;
  
      const response = await axios.get('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${savedToken}`
        }
      });
  
      setUser(response.data.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('프로필 로딩 중 오류:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const initializeAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('accessToken');
  
      if (accessToken) {
        await handleOAuth2Login();
      } else {
        await loadUserProfile(); // 저장된 토큰으로 로그인 시도
      }
    };
  
    initializeAuth();
  }, []);

  // Axios 인터셉터 설정 (토큰 만료 시 처리)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // 401 에러이고 아직 재시도하지 않은 요청이라면
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // 로그아웃 처리
          logout();
          
          // 로그인 페이지로 리다이렉트
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, useAuth };