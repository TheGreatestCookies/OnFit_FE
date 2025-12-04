import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/constants/routes';

const MyContent = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      alert('로그아웃되었습니다.');
      navigate(ROUTES_PATH.HOME);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  if (!userInfo) {
    return (
      <div className="absolute top-16 bottom-16 left-0 right-0 w-full overflow-y-auto px-4 py-6">
        <div className="text-center py-20 text-gray-500">사용자 정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="absolute top-16 bottom-16 left-0 right-0 w-full overflow-y-auto px-4 py-6 bg-gray-50">
      <div className="max-w-md mx-auto">
        {/* 프로필 섹션 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {userInfo.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{userInfo.name}</h2>
              <p className="text-sm text-gray-500">{userInfo.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition-colors"
          >
            로그아웃
          </button>
        </div>

        {/* 마이페이지 메뉴 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center justify-between">
            <span className="font-medium text-gray-700">내가 작성한 글</span>
            <span className="text-gray-400">›</span>
          </button>
          <button className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center justify-between">
            <span className="font-medium text-gray-700">좋아요한 글</span>
            <span className="text-gray-400">›</span>
          </button>
          <button className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center justify-between">
            <span className="font-medium text-gray-700">프로필 수정</span>
            <span className="text-gray-400">›</span>
          </button>
          <button className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between">
            <span className="font-medium text-gray-700">설정</span>
            <span className="text-gray-400">›</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyContent;
