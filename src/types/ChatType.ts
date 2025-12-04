export interface ChatRequest {
  sessionId: string;
  userMessage: string;
  lat?: number;
  lng?: number;
  memberId?: number;
}

export interface Voucher {
  id: number;
  name: string;
  category: string;
  distance: number;
  price: number;
  facilityName: string;
  description: string;
  telephone: string;
}

export interface Video {
  title: string;
  youtubeCode: string;
}

export type ChatResponseType = 'talk' | 'recommend' | 'home_workout';

export interface ChatResponseBase {
  type: ChatResponseType;
}

export interface ChatTalkResponse extends ChatResponseBase {
  type: 'talk';
  chunk: string;
}

export interface ChatRecommendResponse extends ChatResponseBase {
  type: 'recommend';
  message: string;
  vouchers: Voucher[];
}

export interface ChatHomeWorkoutResponse extends ChatResponseBase {
  type: 'home_workout';
  message: string;
  videos: Video[];
}

export type ChatResponse = ChatTalkResponse | ChatRecommendResponse | ChatHomeWorkoutResponse;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  type: ChatResponseType;
  content?: string; // For 'talk'
  vouchers?: Voucher[]; // For 'recommend'
  videos?: Video[]; // For 'home_workout'
  isStreaming?: boolean;
}
