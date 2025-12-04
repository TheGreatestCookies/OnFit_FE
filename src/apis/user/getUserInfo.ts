import apiInstance from '@/apis/apiInstance';
import type { UserInfoResponse } from '@/types/UserType';

export const getUserInfo = async () => {
  const response = await apiInstance.get<UserInfoResponse>('/members/me');
  return response;
};
