import apiInstance from '@/apis/apiInstance';

interface SignupRequest {
  email: string;
  password: string;
  name: string;
  profileImageNumber: number;
}

interface SignupResponse {
  id: number;
  email: string;
  name: string;
  profileImageNumber: number;
}

export const signup = async (data: SignupRequest) => {
  const response = await apiInstance.post<SignupResponse>('/members', data);
  return response.data;
};
