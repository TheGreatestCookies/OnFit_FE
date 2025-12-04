import axios, { type AxiosResponse, type AxiosError } from 'axios';

const apiInstance = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

apiInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        // Handle 401 or token refresh logic here if needed
        return Promise.reject(error);
    }
);

export default apiInstance;
