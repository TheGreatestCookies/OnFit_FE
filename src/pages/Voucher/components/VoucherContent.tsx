import { useState, useEffect } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchVouchers } from '@/api/voucher';

import VoucherMapContent from './VoucherMapContent';
import VoucherListContent from './VoucherListContent';
import { AREA_OPTIONS } from '@/constants/AreaOptions';
import { SPORTS_OPTIONS } from '@/constants/SportsOptions';

/**
 * 바우처 내용 컴포넌트
 * 지도 뷰와 리스트 뷰를 전환할 수 있습니다.
 * 지도 뷰를 default로 설정하는게 더 나을 것 같다.
 * 지도 뷰에서 마커를 클릭하면 해당 바우처의 상세 정보를 표시.
 * 네이버 지도 처럼 아래에 바우처 목록을 제시하고
 * 상단에 검색 탭이 있어서 원하는 바우처를 검색할 수 있도록 하고
 * 필터 또한 제공
 * 마커 핀 초기화 위치는 자기 자신의 위치이고, 제일 처음에는 자기 주변에 존재하는 것들 핀으로 표시.
 * @returns VoucherContent 컴포넌트
 */
const VoucherContent = () => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  // 필터 상태 (자연어로 저장)
  const [area, setArea] = useState('');
  const [sports, setSports] = useState('수영');
  const [isLocationDetected, setIsLocationDetected] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 사용자 위치 기반 초기 지역 설정
  useEffect(() => {
    const detectUserLocation = () => {
      if (!navigator.geolocation) {
        console.log('⚠️ Geolocation을 지원하지 않는 브라우저입니다.');
        setIsLocationDetected(true);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 사용자 위치:', { latitude, longitude });
          setUserLocation({ lat: latitude, lng: longitude });

          // 간단한 위도/경도 기반 지역 추정
          const estimateRegionFromCoords = (lat: number, lng: number): string => {
            // 대한민국 주요 지역 좌표 범위 (대략적)
            if (lat >= 37.4 && lat <= 37.7 && lng >= 126.8 && lng <= 127.2) return '서울특별시';
            if (lat >= 35.0 && lat <= 35.3 && lng >= 128.9 && lng <= 129.3) return '부산광역시';
            if (lat >= 35.7 && lat <= 36.0 && lng >= 128.5 && lng <= 128.8) return '대구광역시';
            if (lat >= 37.3 && lat <= 37.6 && lng >= 126.6 && lng <= 126.8) return '인천광역시';
            if (lat >= 35.1 && lat <= 35.2 && lng >= 126.8 && lng <= 127.0) return '광주광역시';
            if (lat >= 36.3 && lat <= 36.4 && lng >= 127.3 && lng <= 127.5) return '대전광역시';
            if (lat >= 35.5 && lat <= 35.6 && lng >= 129.3 && lng <= 129.4) return '울산광역시';
            if (lat >= 36.4 && lat <= 36.6 && lng >= 127.2 && lng <= 127.3) return '세종특별자치시';
            if (lat >= 36.9 && lat <= 38.3 && lng >= 126.4 && lng <= 127.5) return '경기도  ';
            if (lat >= 37.0 && lat <= 38.6 && lng >= 127.5 && lng <= 129.4) return '강원도';
            if (lat >= 36.3 && lat <= 37.3 && lng >= 127.4 && lng <= 128.5) return '충청북도';
            if (lat >= 36.0 && lat <= 37.0 && lng >= 126.3 && lng <= 127.5) return '충청남도';
            if (lat >= 35.6 && lat <= 36.0 && lng >= 126.7 && lng <= 127.7) return '전라북도';
            if (lat >= 34.2 && lat <= 35.4 && lng >= 126.2 && lng <= 127.5) return '전라남도';
            if (lat >= 35.9 && lat <= 37.2 && lng >= 128.1 && lng <= 129.6) return '경상북도';
            if (lat >= 34.7 && lat <= 35.9 && lng >= 127.7 && lng <= 129.3) return '경상남도';
            if (lat >= 33.2 && lat <= 33.6 && lng >= 126.1 && lng <= 126.9) return '제주특별자치도';
            return ''; // 범위 밖
          };

          const detectedArea = estimateRegionFromCoords(latitude, longitude);

          if (detectedArea) {
            setArea(detectedArea);
            console.log('✅ 감지된 지역:', detectedArea);
          } else {
            console.log('⚠️ 지역 감지 실패, 전체 검색으로 진행');
          }

          setIsLocationDetected(true);
        },
        (error) => {
          console.log('⚠️ 위치 정보를 가져올 수 없습니다:', error.message);
          setIsLocationDetected(true);
        },
        {
          timeout: 10000,
          maximumAge: 0,
        },
      );
    };

    detectUserLocation();
  }, []);

  // 리스트용 데이터 (무한 스크롤)
  const {
    data: listData,
    isLoading: isListLoading,
    isError: isListError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['vouchers', 'list', area, sports],
    queryFn: ({ pageParam = 0 }) =>
      fetchVouchers(area || undefined, sports || undefined, pageParam, 10),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.last ? undefined : allPages.length;
    },
    initialPageParam: 0,
    enabled: isLocationDetected,
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });

  // 지도용 데이터 (전체)
  const { data: mapData, isLoading: isMapLoading } = useQuery({
    queryKey: ['vouchers', 'map', area, sports],
    queryFn: () => fetchVouchers(area || undefined, sports || undefined, 0, 2000),
    enabled: isLocationDetected,
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });

  const listVouchers = listData?.pages.flatMap((page) => page.content) || [];
  const mapVouchers = mapData?.content || [];
  const loading = isListLoading || isMapLoading;
  const error = isListError ? '바우처 목록을 불러오는데 실패했습니다.' : null;

  // 초기 로딩 상태 관리
  useEffect(() => {
    if (isLocationDetected && !isListLoading && !isMapLoading && isInitialLoad) {
      setIsInitialLoad(false);
      console.log('✅ 초기 데이터 로드 완료:', {
        area: area || '전체',
        sports: sports || '전체',
        리스트결과: `${listVouchers.length} 개`,
        지도결과: `${mapData?.content.length || 0} 개`,
      });
    }
  }, [
    isLocationDetected,
    isListLoading,
    isMapLoading,
    isInitialLoad,
    area,
    sports,
    listData,
    mapData,
    listVouchers.length,
  ]);

  // 초기 로딩만 전체 화면 표시
  if (!isLocationDetected || (isInitialLoad && loading)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <div className="text-gray-600 font-medium">
            {!isLocationDetected ? '📍 위치 정보를 확인하는 중...' : '로딩 중...'}
          </div>
          <p className="text-sm text-gray-400 mt-2">주변 스포츠바우처를 찾고 있습니다</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // 필터 props 그룹화
  const filterProps = {
    area,
    sports,
    setArea,
    setSports,
    areaOptions: AREA_OPTIONS,
    sportsOptions: SPORTS_OPTIONS,
  };

  return (
    <div
      className={`absolute top-16 bottom-16 left-0 right-0 w-full bg-gray-50 ${viewMode === 'list' ? 'overflow-y-auto' : 'overflow-hidden'}`}
    >
      {/* 필터 변경 중 로딩 표시 */}
      {loading && !isInitialLoad && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm animate-pulse">
          🔄 업데이트 중...
        </div>
      )}

      {viewMode === 'map' ? (
        <VoucherMapContent
          vouchers={mapVouchers}
          filterProps={{ ...filterProps, page: 0, setPage: () => { }, totalPages: 0 }} // 지도 뷰에서는 페이지네이션 사용 안함
          userLocation={userLocation}
          onSwitchToList={() => setViewMode('list')}
        />
      ) : (
        <VoucherListContent
          vouchers={listVouchers}
          filterProps={filterProps}
          onSwitchToMap={() => setViewMode('map')}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      )}
    </div>
  );
};

export default VoucherContent;
