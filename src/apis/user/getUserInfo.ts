import apiInstance from '@/apis/apiInstance';
import type { UserInfoResponse } from '@/types/UserType';
import type { AxiosResponse } from 'axios';

export const getUserInfo = async (): Promise<
  AxiosResponse<UserInfoResponse>
> => {
  return await apiInstance.get<UserInfoResponse>('/members/me');
};
