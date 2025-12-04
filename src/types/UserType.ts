export interface UserInfo {
    id: number;
    email: string;
    name: string;
    profileImageNumber: number;
}

export interface UserInfoResponse {
    content: UserInfo;
}
