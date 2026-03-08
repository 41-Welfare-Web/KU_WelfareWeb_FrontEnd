import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Admin 페이지 보호 컴포넌트
 * - ADMIN 권한이 있어야 함
 * - 직접 URL 입력으로는 접근 불가 (헤더 버튼을 통해서만 접근 가능)
 */
export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    // 로그인하지 않았거나 ADMIN이 아닌 경우
    if (!isLoggedIn || user?.role !== 'ADMIN') {
      alert('관리자 권한이 필요합니다.');
      navigate('/', { replace: true });
      return;
    }

    // state를 통해 정상적인 네비게이션인지 확인
    // Header의 관리자 버튼을 통해 접근했는지 확인
    const isAuthorizedAccess = location.state?.fromHeader === true;
    const hasSessionFlag = sessionStorage.getItem('adminAccess') === 'true';

    if (!isAuthorizedAccess && !hasSessionFlag) {
      // 직접 URL 입력으로 접근한 경우
      alert('관리자 페이지는 헤더의 관리자 메뉴를 통해 접근해주세요.');
      navigate('/', { replace: true });
      return;
    }

    // 정상 접근인 경우 세션 플래그 설정
    sessionStorage.setItem('adminAccess', 'true');
  }, [isLoggedIn, user, navigate, location]);

  // 페이지 이탈 시 세션 플래그 제거
  useEffect(() => {
    return () => {
      // admin 페이지를 벗어날 때 플래그 제거
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/admin')) {
        sessionStorage.removeItem('adminAccess');
      }
    };
  }, [location.pathname]);

  // 권한이 있는 경우에만 children 렌더링
  if (isLoggedIn && user?.role === 'ADMIN') {
    return <>{children}</>;
  }

  return null;
}
