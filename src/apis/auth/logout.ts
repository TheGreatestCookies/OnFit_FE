import apiInstance from '@/apis/apiInstance';
import type { AxiosResponse } from 'axios';

export interface LogoutResponse {
  message?: string;
}

export const logout = async (): Promise<AxiosResponse<LogoutResponse>> => {
  return await apiInstance.post<LogoutResponse>('/auth/logout');
};
