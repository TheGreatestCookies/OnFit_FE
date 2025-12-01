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

// 목업 데이터 (실제 API 연결 전 테스트용)
const mockVouchers: VoucherItem[] = [
  {
    id: 1,
    name: '강남 헬스클럽 A',
    area: '서울',
    areaCode: 11,
    facilityName: '강남 스포츠센터',
    sports: '헬스',
    sportsCode: 1,
    sigunguCode: 11680,
    sigunguName: '강남구',
    addr1: '서울특별시 강남구 테헤란로 123',
    addr2: '2층',
    zipCode: '06234',
    telephone: '02-1234-5678',
    memberCount: 150,
    price: 50000,
  },
  {
    id: 2,
    name: '송파 수영장',
    area: '서울',
    areaCode: 11,
    facilityName: '송파 아쿠아센터',
    sports: '수영',
    sportsCode: 2,
    sigunguCode: 11710,
    sigunguName: '송파구',
    addr1: '서울특별시 송파구 올림픽로 456',
    addr2: '',
    zipCode: '05555',
    telephone: '02-9876-5432',
    memberCount: 200,
    price: 60000,
  },
  {
    id: 3,
    name: '부산 요가센터',
    area: '부산',
    areaCode: 26,
    facilityName: '해운대 웰니스',
    sports: '요가',
    sportsCode: 3,
    sigunguCode: 26350,
    sigunguName: '해운대구',
    addr1: '부산광역시 해운대구 해운대로 789',
    addr2: '3층',
    zipCode: '48099',
    telephone: '051-1111-2222',
    memberCount: 80,
    price: 45000,
  },
  {
    id: 4,
    name: '대전 탁구장',
    area: '대전',
    areaCode: 30,
    facilityName: '유성 스포츠플라자',
    sports: '탁구',
    sportsCode: 4,
    sigunguCode: 30200,
    sigunguName: '유성구',
    addr1: '대전광역시 유성구 대학로 101',
    addr2: '',
    zipCode: '34141',
    telephone: '042-3333-4444',
    memberCount: 50,
    price: 30000,
  },
  {
    id: 5,
    name: '인천 배드민턴장',
    area: '인천',
    areaCode: 28,
    facilityName: '송도 배드민턴 클럽',
    sports: '배드민턴',
    sportsCode: 5,
    sigunguCode: 28185,
    sigunguName: '연수구',
    addr1: '인천광역시 연수구 송도과학로 202',
    addr2: '1층',
    zipCode: '21984',
    telephone: '032-5555-6666',
    memberCount: 120,
    price: 40000,
  },
];

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
    // API 에러 시 목업 데이터 사용 (개발 중)
    return useMockData(area, sports, page, size);
  }
};

// 목업 데이터 폴백 함수
const useMockData = (
  area?: string,
  sports?: string,
  page: number = 0,
  size: number = 5,
): Promise<VoucherResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = mockVouchers;
      if (area) {
        filtered = filtered.filter((v) => v.area === area);
      }
      if (sports) {
        filtered = filtered.filter((v) => v.sports === sports);
      }

      const start = page * size;
      const end = start + size;
      const content = filtered.slice(start, end);
      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size);

      resolve({
        totalElements,
        totalPages,
        first: page === 0,
        last: page >= totalPages - 1,
        size,
        content,
        number: page,
        numberOfElements: content.length,
        empty: content.length === 0,
      });
    }, 500);
  });
};
