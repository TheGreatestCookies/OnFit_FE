import apiInstance from '@/apis/apiInstance';
import type { AxiosResponse } from 'axios';

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  profileImageNumber: number;
}

export interface SignupResponse {
  id: number;
  email: string;
  name: string;
  profileImageNumber: number;
}

export const signup = async (
  data: SignupRequest,
): Promise<AxiosResponse<SignupResponse>> => {
  return await apiInstance.post<SignupResponse>('/members', data);
};
