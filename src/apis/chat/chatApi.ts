import apiInstance from '@/apis/apiInstance';
import type { ChatRequest } from '@/types/ChatType';

export const sendMessage = async (
    data: ChatRequest,
    onChunk: (chunk: any) => void,
    onComplete: () => void,
    onError: (error: any) => void
) => {
    try {
        console.log('[chatApi] 요청 시작:', data);
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'text/event-stream',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        console.log('[chatApi] 응답 상태:', response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error('Response body is null');
        }

        console.log('[chatApi] 스트림 읽기 시작');
        let chunkCount = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log('[chatApi] 스트림 완료, 총 chunk 수:', chunkCount);
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            console.log('[chatApi] Raw chunk:', chunk);
            const lines = chunk.split('\n');

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('data:')) {
                    // "data:" 또는 "data: " 다음의 JSON 추출
                    const jsonStr = trimmedLine.startsWith('data: ') 
                        ? trimmedLine.slice(6) 
                        : trimmedLine.slice(5);
                    
                    if (jsonStr) {
                        try {
                            const parsed = JSON.parse(jsonStr);
                            console.log('[chatApi] Parsed chunk:', parsed);
                            onChunk(parsed);
                            chunkCount++;
                        } catch (e) {
                            console.error('[chatApi] JSON 파싱 에러:', e, 'Line:', line);
                        }
                    }
                }
            }
        }

        console.log('[chatApi] onComplete 호출');
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
