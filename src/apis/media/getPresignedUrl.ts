import axios from 'axios';
import { API_BASE_URL } from '@/utils/apiConfig';

interface PresignedUrlResponse {
    id: number;
    preSignedUrl: string;
}

export const getPresignedUrl = async (): Promise<{ id: number; presignedUrl: string }> => {
    const response = await axios.get<PresignedUrlResponse>(`${API_BASE_URL}/s3`, {
        withCredentials: true,
    });
    return {
        id: response.data.id,
        presignedUrl: response.data.preSignedUrl,
    };
};
