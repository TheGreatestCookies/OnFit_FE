import type { VoucherResponse } from './voucher';
import { API_BASE_URL } from '@/utils/apiConfig';

// 홈 운동 추천 기록 조회
export const fetchMyHomeWorkoutRecommendations = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/recommendations/home-workouts/my`, {
    credentials: 'include',
  });

  if (response.status === 401) {
    throw { status: 401, message: 'Unauthorized' };
  }

  if (!response.ok) {
    throw new Error('Failed to fetch home workout recommendations');
  }

  return response.json();
};

// 바우처 추천 기록 조회
export const fetchMyVoucherRecommendations = async (): Promise<VoucherResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/recommendations/vouchers/my`, {
    credentials: 'include',
  });

  if (response.status === 401) {
    throw { status: 401, message: 'Unauthorized' };
  }

  if (!response.ok) {
    throw new Error('Failed to fetch voucher recommendations');
  }

  return response.json();
};

