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

    const response = await fetch(`/api/voucher?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch vouchers');
    }
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
