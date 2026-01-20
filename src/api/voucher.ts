import apiInstance from "@/apis/apiInstance";
import { API_BASE_URL } from '@/utils/apiConfig';

export interface VoucherItem {
  id: number;
  name: string;
  area: string;
  areaCode: number;
  facilityName: string;
  sports: string;
  sportsCode: number;
  sigunguCode: number;
  sigunguName: string;
  addr1: string;
  addr2: string;
  zipCode: string;
  telephone: string;
  memberCount: number;
  price: number;
  latitude: number; // DB에서 제공하는 위도
  longitude: number; // DB에서 제공하는 경도
  likeCnt: number; // 좋아요 수
  myLike: boolean; // 내가 좋아요 했는지 여부
}

export interface VoucherResponse {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: VoucherItem[];
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export const fetchVouchers = async (
  area?: string,
  sports?: string,
  page: number = 0,
  size: number = 5,
): Promise<VoucherResponse> => {
  try {
    const params = new URLSearchParams();
    if (area) params.append('area', area);
    if (sports) params.append('sports', sports);
    params.append('page', page.toString());
    params.append('size', size.toString());

    const response = await apiInstance.get(`/vouchers?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// 바우처 좋아요 추가
export const likeVoucher = async (voucherId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/vouchers/${voucherId}/like`, {
    method: 'POST',
    credentials: 'include',
  });

  // 409 Conflict는 이미 좋아요한 상태이므로 성공으로 처리
  if (response.status === 409) {
    return;
  }

  if (!response.ok) {
    throw new Error('Failed to like voucher');
  }
};

// 바우처 좋아요 취소
export const unlikeVoucher = async (voucherId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/vouchers/${voucherId}/like`, {
    method: 'DELETE',
    credentials: 'include',
  });

  // 409 Conflict는 이미 좋아요 취소한 상태이므로 성공으로 처리
  if (response.status === 409) {
    return;
  }

  if (!response.ok) {
    throw new Error('Failed to unlike voucher');
  }
};

// 내가 좋아요한 바우처 조회
export const fetchLikedVouchers = async (
  page: number = 0,
  size: number = 5,
): Promise<VoucherResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/vouchers/like/my?page=${page}&size=${size}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch liked vouchers');
  }

  return response.json();
};
