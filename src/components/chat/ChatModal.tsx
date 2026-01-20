import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ChatMessage, ChatRequest, ChatResponse } from '@/types/ChatType';
import { sendMessage, resetSession } from '@/apis/chat/chatApi';
import { likeVoucher, unlikeVoucher } from '@/api/voucher';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { useAuth } from '@/context/AuthContext';
import { CharacterGreetingMessages, CharacterResetMessages } from '@/constants/CharacterMessages';
import { FaceOptions } from '@/constants/FaceOptions';

const CharacterNames: Record<string, string> = {
  tiger: '범이',
  bear: '곰이',
  dog: '삽살이',
  rabbit: '토끼',
  turtle: '거북이',
  seagull: '갈매기',
};

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const generateSessionId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingMessageRef = useRef<string | null>(null); // 현재 스트리밍 중인 메시지 ID 추적
  const streamingContentRef = useRef<string>(''); // 현재 스트리밍 중인 메시지 내용 (중복 방지)
  const { userInfo } = useAuth();

  // 사용자의 캐릭터 정보
  const characterIndex = (userInfo?.profileImageNumber || 1) - 1;
  const currentCharacter = FaceOptions[characterIndex];
  const characterName = CharacterNames[currentCharacter?.name] || '트레이너';

  // 사용자의 캐릭터에 맞는 인사말 가져오기
  const getGreetingMessage = () => {
    if (!userInfo || !userInfo.profileImageNumber) {
      return CharacterGreetingMessages.TIGER;
    }

    const characterIndex = userInfo.profileImageNumber - 1;
    const character = FaceOptions[characterIndex];

    if (character) {
      const characterKey = character.name.toUpperCase() as keyof typeof CharacterGreetingMessages;
      return CharacterGreetingMessages[characterKey] || CharacterGreetingMessages.TIGER;
    }

    return CharacterGreetingMessages.TIGER;
  };

  // 사용자의 캐릭터에 맞는 초기화 메시지 가져오기
  const getResetMessage = () => {
    if (!userInfo || !userInfo.profileImageNumber) {
      return CharacterResetMessages.TIGER;
    }

    const characterIndex = userInfo.profileImageNumber - 1;
    const character = FaceOptions[characterIndex];

    if (character) {
      const characterKey = character.name.toUpperCase() as keyof typeof CharacterResetMessages;
      return CharacterResetMessages[characterKey] || CharacterResetMessages.TIGER;
    }

    return CharacterResetMessages.TIGER;
  };
  useEffect(() => {
    if (isOpen && !sessionId) {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      // Initial greeting
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          type: 'talk',
          content: getGreetingMessage(),
        },
      ]);
    }
  }, [isOpen, sessionId]);

  // 사용자 위치 정보 가져오기
  useEffect(() => {
    if (isOpen && !userLocation) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.error('위치 정보 가져오기 실패:', error);
            // 위치 정보를 가져오지 못해도 채팅은 계속 가능
          },
        );
      } else {
        console.warn('Geolocation API를 지원하지 않는 브라우저입니다.');
      }
    }
  }, [isOpen, userLocation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      type: 'talk',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Placeholder for bot response
    const botMsgId = (Date.now() + 1).toString();
    streamingMessageRef.current = botMsgId; // 스트리밍 메시지 ID 저장
    streamingContentRef.current = ''; // 스트리밍 내용 초기화
    setMessages((prev) => [
      ...prev,
      {
        id: botMsgId,
        sender: 'bot',
        type: 'talk',
        content: '',
        isStreaming: true,
      },
    ]);

    const requestData: ChatRequest = {
      sessionId,
      userMessage: text,
      memberId: userInfo?.id,
      ...(userLocation && {
        lat: userLocation.lat,
        lng: userLocation.lng,
      }),
    };


    await sendMessage(
      requestData,
      (chunk: ChatResponse) => {
        // Update ref outside of setMessages to avoid double execution in StrictMode
        if (chunk.type === 'talk') {
          streamingContentRef.current += chunk.chunk || '';
        }

        // 함수형 업데이트를 사용하여 항상 최신 상태를 참조
        setMessages((prev) => {
          // streamingMessageRef를 사용하여 정확한 메시지 찾기
          const currentStreamingId = streamingMessageRef.current || botMsgId;
          const targetIndex = prev.findIndex(msg => msg.id === currentStreamingId);

          if (targetIndex === -1) {
            // 메시지를 찾지 못한 경우, 새로 추가
            if (chunk.type === 'talk') {
              return [
                ...prev,
                {
                  id: currentStreamingId,
                  sender: 'bot',
                  type: 'talk',
                  content: streamingContentRef.current,
                  isStreaming: true,
                },
              ];
            } else if (chunk.type === 'recommend') {
              return [
                ...prev,
                {
                  id: currentStreamingId,
                  sender: 'bot',
                  type: 'recommend',
                  content: chunk.message || '',
                  vouchers: chunk.vouchers,
                  isStreaming: false,
                },
              ];
            } else {
              return [
                ...prev,
                {
                  id: currentStreamingId,
                  sender: 'bot',
                  type: 'home_workout',
                  content: chunk.message || '',
                  videos: chunk.videos,
                  isStreaming: false,
                },
              ];
            }
          }

          const newMessages = [...prev];
          const targetMsg = newMessages[targetIndex];

          if (chunk.type === 'talk') {
            // talk 타입: ref에 누적된 내용 사용
            // 단, 이미 recommend나 home_workout 타입인 경우 덮어쓰지 않음
            if (targetMsg.type === 'recommend' || targetMsg.type === 'home_workout') {
              return prev;
            }

            newMessages[targetIndex] = {
              ...targetMsg,
              type: 'talk',
              content: streamingContentRef.current,
              isStreaming: true,
            };
          } else if (chunk.type === 'recommend') {
            // recommend 타입: 기존 talk 버블은 완료 처리, 별도 메시지로 추가
            newMessages[targetIndex] = {
              ...targetMsg,
              isStreaming: false,
            };
            streamingMessageRef.current = null; // 스트리밍 완료
            streamingContentRef.current = ''; // 스트리밍 내용 초기화

            return [
              ...newMessages,
              {
                id: `${currentStreamingId}-recommend`,
                sender: 'bot',
                type: 'recommend',
                content: chunk.message || '',
                vouchers: chunk.vouchers,
                isStreaming: false,
              },
            ];
          } else if (chunk.type === 'home_workout') {
            // home_workout 타입도 별도 메시지로 추가
            newMessages[targetIndex] = {
              ...targetMsg,
              isStreaming: false,
            };
            streamingMessageRef.current = null; // 스트리밍 완료
            streamingContentRef.current = ''; // 스트리밍 내용 초기화

            return [
              ...newMessages,
              {
                id: `${currentStreamingId}-home-workout`,
                sender: 'bot',
                type: 'home_workout',
                content: chunk.message || '',
                videos: chunk.videos,
                isStreaming: false,
              },
            ];
          }

          return newMessages;
        });
      },
      () => {
        setIsLoading(false);
        streamingMessageRef.current = null; // 스트리밍 완료
        streamingContentRef.current = ''; // 스트리밍 내용 초기화
        setMessages((prev) => {
          const currentStreamingId = botMsgId;
          const targetIndex = prev.findIndex(msg => msg.id === currentStreamingId);
          if (targetIndex === -1) return prev;

          const newMessages = [...prev];
          const targetMsg = newMessages[targetIndex];
          
          // recommend나 home_workout 타입인 경우 타입을 유지하고 isStreaming만 업데이트
          if (targetMsg.type === 'recommend' || targetMsg.type === 'home_workout') {
            newMessages[targetIndex] = {
              ...targetMsg,
              isStreaming: false,
            };
          } else {
            // talk 타입인 경우에만 기존 로직 사용
            newMessages[targetIndex] = {
              ...targetMsg,
              isStreaming: false,
            };
          }
          
          return newMessages;
        });
      },
      (error) => {
        console.error('Chat error:', error);
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'bot',
            type: 'talk',
            content: '죄송합니다. 오류가 발생했습니다.',
          },
        ]);
      },
    );
  };

  const handleLike = async (voucherId: number) => {
    try {
      await likeVoucher(voucherId);
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.type === 'recommend' && msg.vouchers) {
            return {
              ...msg,
              vouchers: msg.vouchers.map((v) =>
                v.id === voucherId
                  ? { ...v, myLike: true, likeCnt: (v.likeCnt ?? (v as any).likeCount ?? 0) + 1 }
                  : v
              ),
            };
          }
          return msg;
        })
      );
    } catch (error) {
      console.error('Failed to like voucher:', error);
    }
  };

  const handleUnlike = async (voucherId: number) => {
    try {
      await unlikeVoucher(voucherId);
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.type === 'recommend' && msg.vouchers) {
            return {
              ...msg,
              vouchers: msg.vouchers.map((v) =>
                v.id === voucherId
                  ? {
                    ...v,
                    myLike: false,
                    likeCnt: Math.max((v.likeCnt ?? (v as any).likeCount ?? 0) - 1, 0),
                  }
                  : v
              ),
            };
          }
          return msg;
        })
      );
    } catch (error) {
      console.error('Failed to unlike voucher:', error);
    }
  };

  const handleReset = async () => {
    if (sessionId) {
      try {
        await resetSession(sessionId);
      } catch (e) {
        console.error(e);
      }
    }
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        type: 'talk',
        content: getResetMessage(),
      },
    ]);
    setSessionId(generateSessionId());
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-red-500 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <img
              src={currentCharacter?.src}
              alt="character"
              className="w-8 h-8"
            />
            <h2 className="font-bold text-lg">
              {characterName}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1 hover:bg-blue-600 rounded-full transition-colors"
              title="대화 초기화"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-600 rounded-full transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              onLike={handleLike}
              onUnlike={handleUnlike}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>,
    document.body,
  );
};

export default ChatModal;
