import apiInstance from '@/apis/apiInstance';
import type { AxiosResponse } from 'axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
}

export const login = async (
  data: LoginRequest,
): Promise<AxiosResponse<LoginResponse>> => {
  return await apiInstance.post<LoginResponse>('/auth/login', data);
};
