import apiInstance from '@/apis/apiInstance';

export const logout = async () => {
  const response = await apiInstance.post('/auth/logout');
  return response.data;
};
