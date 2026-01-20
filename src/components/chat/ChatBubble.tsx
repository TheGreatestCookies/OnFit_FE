import type { ChatMessage } from '@/types/ChatType';
import RecommendationCard from './RecommendationCard';
import { useAuth } from '@/context/AuthContext';
import { FaceOptions } from '@/constants/FaceOptions';
interface ChatBubbleProps {
  message: ChatMessage;
  onLike?: (voucherId: number) => void;
  onUnlike?: (voucherId: number) => void;
}

const ChatBubble = ({ message, onLike, onUnlike }: ChatBubbleProps) => {
  const isUser = message.sender === 'user';
  const { userInfo } = useAuth();

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <img
          src={FaceOptions[(userInfo?.profileImageNumber || 1) - 1].src}
          alt="character"
          className="w-8 h-8"
        />

      )}
      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2 rounded-2xl text-sm ${isUser
            ? 'bg-red-500 text-white rounded-tr-none'
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}
        >
          {message.content}
        </div>

        {(message.type === 'recommend' || message.type === 'home_workout') && (

          <RecommendationCard
            type={message.type}
            vouchers={message.vouchers}
            videos={message.videos}
            onLike={onLike}
            onUnlike={onUnlike}
          />
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
