import { useAuth } from '@/context/AuthContext';
import { generatePath, useLocation, useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '@/constants/RoutePath';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}
/**
 * 로그인 확인 페이지
 * 로그인이 되어있지 않으면 로그인 페이지로 리다이렉트
 * 리다이렉트 중이면 렌더 막기
 * @param children - 로그인이 되었을 때 표시될 페이지
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🛡️ ProtectedRoute check:', { isInitialized, isLoggedIn, path: location.pathname });
    // 초기화가 완료되고 로그인되지 않은 경우에만 리다이렉트
    if (isInitialized && !isLoggedIn) {
      console.log('❌ Not logged in, redirecting to login');
      const cont = encodeURIComponent(location.pathname + location.search + location.hash);
      navigate(`${generatePath(ROUTE_PATH.LOGIN)}?continue=${cont}`, {
        replace: true,
      });
    } else if (isInitialized && isLoggedIn) {
      console.log('✅ Logged in, allowing access');
    }
  }, [isLoggedIn, isInitialized, navigate, location]);

  // 초기화 중이거나 로그인되지 않은 경우 null 반환
  if (!isInitialized || !isLoggedIn) return null;
  return <>{children}</>;
};

export default ProtectedRoute;
