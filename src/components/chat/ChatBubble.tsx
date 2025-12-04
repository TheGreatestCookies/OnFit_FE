import type { ChatMessage } from '@/types/ChatType';
import RecommendationCard from './RecommendationCard';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
          <span className="text-lg">🤖</span>
        </div>
      )}
      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2 rounded-2xl text-sm ${
            isUser
              ? 'bg-blue-500 text-white rounded-tr-none'
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
          />
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
