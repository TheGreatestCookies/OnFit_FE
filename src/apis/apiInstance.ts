import axios, { type AxiosResponse, type AxiosError } from 'axios';
import { API_BASE_URL } from '@/utils/apiConfig';

const apiInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 포함

});

apiInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Handle 401 or token refresh logic here if needed
    return Promise.reject(error);
  },
);

export default apiInstance;
