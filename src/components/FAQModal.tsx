import { useState } from 'react';
import LogoIcon from './icon/LogoIcon';
import IconName from '@/constants/IconName';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  faqItems?: FAQItem[];
}

const defaultFAQItems: FAQItem[] = [
  {
    question: '운동 추천은 어떻게 받나요?',
    answer: '홈 화면의 캐릭터를 클릭하여 채팅을 시작하면, 가장 친절한 친구가 당신의 기분과 상태에 맞는 운동을 추천해드립니다. 바우처 추천과 홈 운동 추천을 모두 받을 수 있습니다.',
  },
  {
    question: '바우처는 어떻게 좋아요 할 수 있나요?',
    answer: '바우처 목록이나 지도에서 각 바우처 카드의 하트 아이콘을 클릭하면 좋아요할 수 있습니다. 좋아요한 바우처는 마이페이지에서 확인할 수 있습니다.',
  },
  {
    question: '게시글은 하루에 몇 개까지 작성할 수 있나요?',
    answer: '하루에 한 개의 게시글만 작성할 수 있습니다. 이미 작성한 게시글이 있다면 수정 또는 삭제만 가능합니다.',
  },
  {
    question: '프로필 사진은 어떻게 변경하나요?',
    answer: '마이페이지에서 프로필 수정 기능을 통해 캐릭터를 변경할 수 있습니다. 다양한 캐릭터 중에서 선택할 수 있습니다.',
  },
  {
    question: '회원탈퇴를 하면 데이터는 어떻게 되나요?',
    answer: '회원탈퇴 시 작성한 모든 게시글, 좋아요한 글, 좋아요한 바우처, 추천 기록 등이 모두 삭제되며 복구할 수 없습니다. 신중하게 결정해주세요.',
  },
];

const FAQModal = ({ isOpen, onClose, faqItems = defaultFAQItems }: FAQModalProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <LogoIcon src={IconName.LOGO2} alt={IconName.LOGO2} />
            <h2 className="text-xl font-bold text-gray-900">자주 묻는 질문</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className={`border rounded-lg transition-all ${
                  openIndex === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => handleToggle(index)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-gray-900 pr-4">{item.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-4 pb-3 pt-0">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQModal;

