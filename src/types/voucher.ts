/**
 * 바우처 필터 관련 공통 Props 타입
 */
export interface FilterProps {
  area: string; // 선택된 지역 (자연어)
  sports: string; // 선택된 종목 (자연어)
  setArea: (value: string) => void;
  setSports: (value: string) => void;
  page: number;
  setPage: (value: number) => void;
  totalPages: number;
  areaOptions: readonly string[];
  sportsOptions: readonly string[];
}
