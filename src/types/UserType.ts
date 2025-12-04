export interface UserInfo {
    id: number;
    email: string;
    name: string;
    profileImageNumber: number;
}

// API 응답은 UserInfo를 직접 반환합니다 (content 래퍼 없음)
export type UserInfoResponse = UserInfo;
