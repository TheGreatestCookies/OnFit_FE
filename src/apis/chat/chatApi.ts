import apiInstance from '@/apis/apiInstance';
import type { ChatRequest, ChatResponse } from '@/types/ChatType';

// 환경변수에서 API Base URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const sendMessage = async (
    data: ChatRequest,
    onChunk: (chunk: ChatResponse) => void,
    onComplete: () => void,
    onError: (error: unknown) => void,
) => {
    try {
        // 환경변수를 사용하여 직접 백엔드 URL로 요청
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'text/event-stream',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });


        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');

        if (!reader) {
            throw new Error('Response body is null');
        }

        let buffer = ''; // 불완전한 라인을 저장할 버퍼

        const processLine = (line: string) => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data:')) {
                // "data:" 또는 "data: " 다음의 JSON 추출
                const jsonStr = trimmedLine.startsWith('data: ')
                    ? trimmedLine.slice(6)
                    : trimmedLine.slice(5);

                if (jsonStr) {
                    try {
                        const parsed = JSON.parse(jsonStr);
                        onChunk(parsed);
                    } catch (e) {
                        console.error('[chatApi] JSON 파싱 에러:', e, 'Line:', line);
                    }
                }
            }
        };

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                // 마지막 디코딩 (남은 버퍼 처리)
                const finalChunk = decoder.decode();
                buffer += finalChunk;
                if (buffer.trim()) {
                    processLine(buffer);
                }
                break;
            }

            // UTF-8 디코딩 (stream: true로 불완전한 문자 처리)
            buffer += decoder.decode(value, { stream: true });
            
            // 완전한 라인만 처리
            const lines = buffer.split('\n');
            // 마지막 요소는 불완전한 라인일 수 있으므로 버퍼에 보관
            buffer = lines.pop() || '';

            // 완전한 라인들 처리
            for (const line of lines) {
                if (line.trim()) {
                    processLine(line);
                }
            }
        }

        onComplete();
    } catch (error) {
        console.error('[chatApi] 에러 발생:', error);
        onError(error);
    }
};

export const resetSession = async (sessionId: string) => {
    const response = await apiInstance.delete(`/chat/${sessionId}`);
    return response;
};
