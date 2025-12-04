import apiInstance from '@/apis/apiInstance';

interface LoginRequest {
    email: string;
    password: string;
}

export const login = async (data: LoginRequest) => {
    const response = await apiInstance.post('/auth/login', data);
    return response;
};
