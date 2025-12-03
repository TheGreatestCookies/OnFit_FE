import IconName from '@/constants/IconName';
import CharacterIcon from '@/components/icon/CharacterIcon';
const HomeContent = ({ image }: { image: string }) => {
  const position = {
    top: 40,
    left: 40,
  };

  const messages = [
    "오늘도 힘내서 운동해봐요! 💪",
    "주변에 재미있는 강좌가 많아요! 👀",
    "스포츠바우처, 잊지 않으셨죠? 🎫",
    "건강한 하루 되세요! ✨",
    "운동하기 딱 좋은 날씨네요! ☀️"
  ];

  // 랜덤 메시지 선택 (hydration mismatch 방지를 위해 useEffect 사용 가능하지만, 여기선 간단히)
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="absolute top-16 bottom-16 left-0 right-0 w-full overflow-hidden">
      <img src={image} alt="home" className="w-full h-full object-cover" />
      <div className="absolute top-0 left-0 right-0 w-full h-full pointer-events-none">

        {/* 캐릭터 및 말풍선 래퍼 */}
        <div
          className="absolute pointer-events-auto cursor-pointer group"
          style={{ top: `${position.top}%`, left: `${position.left}%` }}
        >
          <div className="relative">
            {/* 말풍선 */}
            <div className="absolute -top-24 left-3/4 -translate-x-1/2 bg-white px-5 py-3 rounded-2xl shadow-xl whitespace-nowrap animate-bounce-in z-10">
              <p className="text-gray-800 font-bold text-lg">{randomMessage}</p>
              {/* 말풍선 꼬리 */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
            </div>

            <CharacterIcon
              src={IconName.TIGER}
              alt={IconName.TIGER}
              size={240}
              className="hover:scale-110 transition-transform duration-300 drop-shadow-lg"
            />
          </div>
        </div>
        <div className="flex items-right gap-2 absolute top-2 left-24 w-full justify-center">
          <button
            onClick={() => { }}
            className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 bg-red-300 hover:bg-red-600`}
          >
            <span className="text-white text-2xl font-light">+</span>
          </button>
          <button
            onClick={() => { }}
            className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 bg-red-300 hover:bg-red-600`}
          >
            <span className="text-white text-2xl font-light">+</span>
          </button>
          <button
            onClick={() => { }}
            className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 bg-red-300 hover:bg-red-600`}
          >
            <span className="text-white text-2xl font-light">+</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
