import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ChatMessage, ChatRequest, ChatResponse } from '@/types/ChatType';
import { sendMessage, resetSession } from '@/apis/chat/chatApi';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { useAuth } from '@/context/AuthContext';

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
    const { userInfo } = useAuth();

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
                    content: '안녕하세요! 무엇을 도와드릴까요?',
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
                        console.log('위치 정보 가져오기 성공:', {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    },
                    (error) => {
                        console.error('위치 정보 가져오기 실패:', error);
                        // 위치 정보를 가져오지 못해도 채팅은 계속 가능
                    }
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

        console.log('채팅 요청 데이터:', requestData);

        await sendMessage(
            requestData,
            (chunk: ChatResponse) => {
                console.log('Received chunk:', chunk);
                setMessages((prev) => {
                    const newMessages = [...prev];
                    // 마지막 메시지 찾기 (봇의 placeholder 메시지)
                    const lastMsgIndex = newMessages.length - 1;
                    
                    if (lastMsgIndex < 0) return prev;

                    const lastMsg = newMessages[lastMsgIndex];

                    // 해당 메시지가 우리가 만든 봇 메시지인지 확인
                    if (lastMsg.id !== botMsgId) return prev;

                    if (chunk.type === 'talk') {
                        // talk 타입: 기존 content에 chunk를 추가
                        newMessages[lastMsgIndex] = {
                            ...lastMsg,
                            type: 'talk',
                            content: (lastMsg.content || '') + chunk.chunk,
                            isStreaming: true,
                        };
                    } else if (chunk.type === 'recommend') {
                        // recommend 타입: 전체 메시지 교체
                        newMessages[lastMsgIndex] = {
                            ...lastMsg,
                            type: 'recommend',
                            content: chunk.message,
                            vouchers: chunk.vouchers,
                            isStreaming: false,
                        };
                    } else if (chunk.type === 'home_workout') {
                        // home_workout 타입: 전체 메시지 교체
                        newMessages[lastMsgIndex] = {
                            ...lastMsg,
                            type: 'home_workout',
                            content: chunk.message,
                            videos: chunk.videos,
                            isStreaming: false,
                        };
                    }

                    return newMessages;
                });
            },
            () => {
                setIsLoading(false);
                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg.id === botMsgId) {
                        lastMsg.isStreaming = false;
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
            }
        );
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
                content: '대화가 초기화되었습니다. 무엇을 도와드릴까요?',
            },
        ]);
        setSessionId(generateSessionId());
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="bg-blue-500 p-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🤖</span>
                        <h2 className="font-bold text-lg">AI 트레이너</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReset}
                            className="p-1 hover:bg-blue-600 rounded-full transition-colors"
                            title="대화 초기화"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                        </button>
                        <button onClick={onClose} className="p-1 hover:bg-blue-600 rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {messages.map((msg) => (
                        <ChatBubble key={msg.id} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <ChatInput onSend={handleSend} disabled={isLoading} />
            </div>
        </div>,
        document.body
    );
};

export default ChatModal;
