import { useState } from 'react';
import LogoIcon from '@/components/icon/LogoIcon';
import IconName from '@/constants/IconName';
import { FaceOptions } from '@/constants/FaceOptions';

interface CharacterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onSelect: (characterId: number) => void;
  mode?: 'full' | 'face';
}

const CHARACTERS = [
  { name: 'tiger', src: '/characters/tiger.svg', id: 1 },
  { name: 'bear', src: '/characters/bear.svg', id: 2 },
  { name: 'dog', src: '/characters/dog.svg', id: 3 },
  { name: 'rabbit', src: '/characters/rabbit.svg', id: 4 },
  { name: 'turtle', src: '/characters/turtle.svg', id: 5 },
  { name: 'seagull', src: '/characters/seagull.svg', id: 6 },
];

const CharacterSelectModal = ({ isOpen, onClose, isLoggedIn, onSelect, mode = 'full' }: CharacterSelectModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const items = mode === 'full' ? CHARACTERS : FaceOptions;
  const currentItem = items[currentIndex];
  const totalItems = items.length;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
  };

  const handleSelect = () => {
    if (isLoggedIn) {
      onSelect(currentItem.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up overflow-hidden">
        {/* 상단 배너 */}
        <div className="bg-red-500 w-full h-16 flex items-center justify-center gap-2">
          <LogoIcon src={IconName.LOGO2} alt="로고" size={32} />
          <h2 className="text-xl font-bold text-white">마음핏프렌즈</h2>
        </div>

        {/* 내용 영역 */}
        <div className="p-6">
          {/* 문구 */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
            원하는 트레이너를 골라보세요!
          </h3>

          {/* 모드에 따른 렌더링 */}
          {mode === 'full' ? (
            /* 캐릭터 캐러셀 (Full Mode) */
            <div className="relative mb-6">
              {/* 이전 버튼 */}
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="이전 캐릭터"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* 캐릭터 이미지 */}
              <div className="flex justify-center items-center min-h-[300px]">
                <img
                  src={currentItem.src}
                  alt={currentItem.name}
                  className="w-64 h-64 object-contain"
                />
              </div>

              {/* 다음 버튼 */}
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="다음 캐릭터"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* 인디케이터 */}
              <div className="flex justify-center gap-2 mt-4">
                {items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    aria-label={`${index + 1}번째 캐릭터`}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* 얼굴 그리드 (Face Mode) */
            <div className="grid grid-cols-3 gap-4 mb-6">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative rounded-xl overflow-hidden transition-all duration-300 aspect-square flex items-center justify-center ${index === currentIndex
                    ? 'ring-4 ring-red-500 scale-105 z-10'
                    : 'hover:scale-105'
                    }`}
                >
                  <img
                    src={item.src}
                    alt={item.name}
                    className={`w-20 h-20 object-contain transition-all duration-300 ${index === currentIndex
                      ? 'brightness-100 grayscale-0'
                      : 'brightness-50 grayscale hover:brightness-75'
                      }`}
                  />
                </button>
              ))}
            </div>
          )}

          {/* 버튼 그룹 */}
          <div className="flex gap-2">
            {/* 닫힘 버튼 */}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              닫기
            </button>
            {/* 선택 버튼 */}
            <button
              onClick={handleSelect}
              disabled={!isLoggedIn}
              className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${isLoggedIn
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-300 cursor-not-allowed'
                }`}
            >
              선택
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelectModal;

