import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '@/constants/RoutePath';
import { FaceOptions } from '@/constants/FaceOptions';
import CharacterIcon from '@/components/icon/CharacterIcon';
import CharacterSelectModal from '@/components/CharacterSelectModal';
import { updateProfileImage } from '@/apis/member/updateProfileImage';
import { toast } from 'react-toastify';

const MyContent = () => {
  const { userInfo, logout, refreshUserInfo } = useAuth();
  const navigate = useNavigate();
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('로그아웃되었습니다.');
      navigate(ROUTE_PATH.HOME);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleProfileEditClick = () => {
    setIsProfileEditModalOpen(true);
  };

  const handleCharacterSelect = async (characterId: number) => {
    try {
      await updateProfileImage({ profileImageNumber: characterId });
      await refreshUserInfo();
      setIsProfileEditModalOpen(false);
      toast.success('프로필 이미지가 변경되었습니다.');
    } catch (error) {
      console.error('Failed to update profile image:', error);
      toast.error('프로필 이미지 변경에 실패했습니다.');
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
    <div className="absolute top-16 bottom-16 left-0 right-0 w-full overflow-y-auto px-4 py-6 bg-gray-0">
      <div className="max-w-md mx-auto">
        {/* 프로필 섹션 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center gap-4 mb-6">
            <CharacterIcon
              src={FaceOptions[userInfo.profileImageNumber - 1].src}
              alt={FaceOptions[userInfo.profileImageNumber - 1].name}
              size={80}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{userInfo.name}</h2>
              <p className="text-sm text-gray-500">{userInfo.email}</p>
            </div>
          </div>
        </div>

        {/* 마이페이지 메뉴 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => navigate(ROUTE_PATH.RECOMMENDATION_HISTORY)}
            className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center justify-between"
          >
            <span className="font-medium text-gray-700">나의 추천 기록</span>
            <span className="text-gray-400">›</span>
          </button>
          <button
            onClick={() => navigate(ROUTE_PATH.MY_POSTS)}
            className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center justify-between"
          >
            <span className="font-medium text-gray-700">내가 작성한 글</span>
            <span className="text-gray-400">›</span>
          </button>
          <button
            onClick={() => navigate(ROUTE_PATH.LIKED_POSTS)}
            className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center justify-between"
          >
            <span className="font-medium text-gray-700">좋아요한 글</span>
            <span className="text-gray-400">›</span>
          </button>
          <button
            onClick={() => navigate(ROUTE_PATH.LIKED_VOUCHERS)}
            className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center justify-between"
          >
            <span className="font-medium text-gray-700">좋아요한 바우처</span>
            <span className="text-gray-400">›</span>
          </button>
          <button
            onClick={handleProfileEditClick}
            className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center justify-between"
          >
            <span className="font-medium text-gray-700">프로필 수정</span>
            <span className="text-gray-400">›</span>
          </button>
          <button onClick={handleLogout} className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between">
            <span className="font-medium text-red-700">로그아웃</span>
            <span className="text-gray-400">›</span>
          </button>
        </div>
      </div>

      <CharacterSelectModal
        isOpen={isProfileEditModalOpen}
        onClose={() => setIsProfileEditModalOpen(false)}
        isLoggedIn={true}
        onSelect={handleCharacterSelect}
        mode="face"
      />
    </div>
  );
};

export default MyContent;
