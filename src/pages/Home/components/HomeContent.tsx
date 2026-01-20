import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CharacterOptions } from '@/constants/CharacterOptions';
import CharacterIcon from '@/components/icon/CharacterIcon';
import HomeContentFeatures from './HomeContentFeatures';
import ChatModal from '@/components/chat/ChatModal';
import ConfirmModal from '@/components/ConfirmModal';
import FAQModal from '@/components/FAQModal';
import CharacterSelectModal from '@/components/CharacterSelectModal';
import { characterMessages } from '@/constants/CharacterMessages';
import { useAuth } from '@/context/AuthContext';
import { FaceOptions } from '@/constants/FaceOptions';
import { ROUTE_PATH } from '@/constants/RoutePath';
import { updateProfileImage } from '@/apis/member/updateProfileImage';
const HomeContent = ({ image }: { image: string }) => {
  /**
   * HomeContent
   * 홈화면 컴포넌트
   * 상단에 3가지의 기능이 있음
   * 챗기록, 아바타 설명 모달 띄우기, 공지사항
   * @param image
   * @returns
   */
  const position = {
    top: 45,
    left: 50,
  };


  const { userInfo, isLoggedIn, refreshUserInfo } = useAuth();
  const navigate = useNavigate();
  // 랜덤 메시지 선택 (hydration mismatch 방지를 위해 useEffect 사용 가능하지만, 여기선 간단히)
  let randomMessage = '';

  if (!userInfo || !userInfo.profileImageNumber) {
    // 로그인하지 않았거나 프로필 이미지가 없으면 기본 TIGER 메시지
    randomMessage = characterMessages.TIGER[Math.floor(Math.random() * characterMessages.TIGER.length)];
  } else {
    // 사용자의 프로필 이미지 번호에 해당하는 캐릭터 찾기
    const characterIndex = userInfo.profileImageNumber - 1;
    const character = FaceOptions[characterIndex];

    if (character) {
      // 캐릭터 이름을 대문자로 변환하여 characterMessages의 키로 사용
      const characterKey = character.name.toUpperCase() as keyof typeof characterMessages;
      const messages = characterMessages[characterKey];

      if (messages && messages.length > 0) {
        randomMessage = messages[Math.floor(Math.random() * messages.length)];
      } else {
        // 메시지가 없으면 기본 TIGER 메시지
        randomMessage = characterMessages.TIGER[Math.floor(Math.random() * characterMessages.TIGER.length)];
      }
    } else {
      // 캐릭터를 찾을 수 없으면 기본 TIGER 메시지
      randomMessage = characterMessages.TIGER[Math.floor(Math.random() * characterMessages.TIGER.length)];
    }
  }

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [isCharacterSelectModalOpen, setIsCharacterSelectModalOpen] = useState(false);

  const handleCharacterClick = () => {
    setIsChatOpen(true);
  };

  const handleRecommendationHistoryClick = () => {
    if (!userInfo) {
      setIsLoginRequiredModalOpen(true);
    } else {
      navigate(ROUTE_PATH.RECOMMENDATION_HISTORY);
    }
  };

  const handleNoticeClick = () => {
    setIsFAQModalOpen(true);
  };

  const handleCharacterChangeClick = () => {
    setIsCharacterSelectModalOpen(true);
  };

  const handleCharacterSelect = async (characterId: number) => {
    try {
      await updateProfileImage({ profileImageNumber: characterId });
      await refreshUserInfo();
      setIsCharacterSelectModalOpen(false);
    } catch (error) {
      console.error('Failed to update profile image:', error);
      // 에러 처리 (예: 토스트 메시지)
    }
  };

  return (
    <div className="absolute top-16 bottom-16 left-0 right-0 w-full overflow-hidden">
      <img src={image} alt="home" className="w-full h-full object-cover" />
      <div className="absolute top-0 left-0 right-0 w-full h-full pointer-events-none">
        {/* 캐릭터 및 말풍선 래퍼 */}
        <div
          className="absolute pointer-events-auto cursor-pointer group"
          style={{ top: `${position.top}%`, left: `${position.left}%` }}
          onClick={handleCharacterClick}
        >
          <div className="relative">
            {/* 말풍선 */}
            <div className="absolute -top-35 left-[120px] -translate-x-1/2 bg-white px-5 py-3 rounded-2xl shadow-xl w-[300px] animate-bounce-in z-10">
              <p className="text-gray-800 font-bold text-lg text-center">{randomMessage}</p>
              {/* 말풍선 꼬리 */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
            </div>

            <CharacterIcon
              src={
                userInfo?.profileImageNumber
                  ? CharacterOptions[userInfo.profileImageNumber - 1].src
                  : CharacterOptions[0].src
              }
              alt={
                userInfo?.profileImageNumber
                  ? CharacterOptions[userInfo.profileImageNumber - 1].name
                  : CharacterOptions[0].name
              }
              size={240}
              className="hover:scale-110 transition-transform duration-300 drop-shadow-lg"
            />
          </div>
        </div>
        <HomeContentFeatures
          onRecommendationHistoryClick={handleRecommendationHistoryClick}
          onNoticeClick={handleNoticeClick}
          onCharacterChangeClick={handleCharacterChangeClick}
        />
      </div>

      <ChatModal
        key={userInfo?.profileImageNumber}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* FAQ 모달 */}
      <FAQModal isOpen={isFAQModalOpen} onClose={() => setIsFAQModalOpen(false)} />

      {/* 캐릭터 선택 모달 */}
      <CharacterSelectModal
        isOpen={isCharacterSelectModalOpen}
        onClose={() => setIsCharacterSelectModalOpen(false)}
        isLoggedIn={isLoggedIn}
        onSelect={handleCharacterSelect}
      />

      {/* 로그인 필요 모달 */}
      <ConfirmModal
        isOpen={isLoginRequiredModalOpen}
        title="로그인 필요"
        message="추천 기록을 보려면 로그인이 필요합니다. 로그인하시겠습니까?"
        confirmText="로그인"
        cancelText="취소"
        onConfirm={() => {
          setIsLoginRequiredModalOpen(false);
          window.location.href = '/login';
        }}
        onCancel={() => setIsLoginRequiredModalOpen(false)}
        isDanger={false}
      />
    </div>
  );
};

export default HomeContent;
