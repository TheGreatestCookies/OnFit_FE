import { useLocation, useNavigate } from 'react-router-dom';
import IconName from '@/constants/IconName';
import LogoIcon from '@/components/icon/LogoIcon';
import Icon from '@/components/icon/Icon';
import { ROUTE_PATH } from '@/constants/RoutePath';

interface HeaderProps {
  type?: 'default' | 'custom';
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header = ({ type = 'default', showBackButton, onBackClick }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  // 경로별 제목 매핑
  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case ROUTE_PATH.HOME:
        return 'MaumFit';
      case ROUTE_PATH.MY_PAGE:
        return '마이페이지';
      case ROUTE_PATH.MY_POSTS:
        return '내가 작성한 글';
      case ROUTE_PATH.LIKED_POSTS:
        return '좋아요한 글';
      case ROUTE_PATH.LIKED_VOUCHERS:
        return '좋아요한 바우처';
      case ROUTE_PATH.RECOMMENDATION_HISTORY:
        return '나의 추천 기록';
      case ROUTE_PATH.VOUCHER:
        return '스포츠 바우처';
      case ROUTE_PATH.COMMUNITY:
        return '커뮤니티';
      case ROUTE_PATH.LOGIN:
        return '로그인';
      case ROUTE_PATH.SIGNUP:
        return '회원가입';
      default:
        return 'MaumFit';
    }
  };

  const pageTitle = getPageTitle(location.pathname);
  const isHomePage = location.pathname === ROUTE_PATH.HOME;
  
  // 뒤로가기 버튼 표시 여부 결정
  const shouldShowBackButton = showBackButton !== undefined 
    ? showBackButton 
    : !isHomePage && type === 'default';

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-16 bg-white border-b border-gray-200 z-10">
      <div className="w-full h-full flex items-center px-4">
        {/* 뒤로가기 버튼 */}
        {shouldShowBackButton && (
          <button
            onClick={handleBackClick}
            className="flex items-center justify-center w-10 h-10 -ml-2 mr-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="뒤로가기"
          >
            <Icon src={IconName.ARROW_BACK} alt="뒤로가기" size={24} className="text-gray-700" />
          </button>
        )}
        
        {/* 로고와 제목 */}
        <div className="flex items-center justify-center gap-2 flex-1">
        <LogoIcon src={IconName.LOGO2} alt={IconName.LOGO2} />
          <h1 className="text-2xl font-bold">{pageTitle}</h1>
        </div>
        
        {/* 뒤로가기 버튼이 있을 때 공간 맞추기 */}
        {shouldShowBackButton && <div className="w-10" />}
      </div>
    </div>
  );
};

export default Header;
