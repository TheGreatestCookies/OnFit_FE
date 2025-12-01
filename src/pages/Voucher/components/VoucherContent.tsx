import { useState, useEffect, useRef } from 'react';
import { fetchVouchers } from '@/api/voucher';
import type { VoucherItem } from '@/api/voucher';

// 지역 옵션
const AREA_OPTIONS = [
  '서울',
  '부산',
  '대구',
  '인천',
  '광주',
  '대전',
  '울산',
  '세종',
  '경기',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
];

// 종목 옵션
const SPORTS_OPTIONS = [
  '헬스',
  '수영',
  '요가',
  '탁구',
  '배드민턴',
  '필라테스',
  '태권도',
  '클라이밍',
  '골프',
  '테니스',
  '스쿼시',
  '농구',
  '축구',
];

const VoucherContent = () => {
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isList, setIsList] = useState(true);
  const mapRef = useRef<HTMLDivElement | null>(null);
  // 필터 상태
  const [area, setArea] = useState('');
  const [sports, setSports] = useState('');

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchVouchers(area || undefined, sports || undefined, page, 5);
        setVouchers(data.content);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError('바우처 목록을 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadVouchers();
  }, [area, sports, page]);

  // 네이버 맵 초기화
  useEffect(() => {
    if (!isList && mapRef.current && window.naver?.maps) {
      const mapOptions = {
        center: new window.naver.maps.LatLng(37.5665, 126.978), // 서울시청 좌표
        zoom: 13,
      };
      // 네이버 맵 인스턴스 생성 (나중에 마커 추가 시 사용)
      new window.naver.maps.Map(mapRef.current, mapOptions);

      // 바우처 위치에 마커 표시 (나중에 구현)
      // vouchers.forEach((voucher) => {
      //   if (voucher.addr1) {
      //     // 주소를 좌표로 변환하는 것은 Geocoding API가 필요합니다
      //   }
      // });
    }
  }, [isList, vouchers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">로딩 중...</div>
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

  return (
    <div className="absolute top-16 bottom-16 left-0 right-0 w-full overflow-y-auto px-4 py-6">
      <button onClick={() => setIsList(!isList)}>{isList ? '지도 뷰' : '리스트 뷰'}</button>
      {isList ? (
        <>
          {/* 필터 영역 */}
          <div className="mb-4 space-y-2">
            <select
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                setPage(0);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">전체 지역</option>
              {AREA_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={sports}
              onChange={(e) => {
                setSports(e.target.value);
                setPage(0);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">전체 종목</option>
              {SPORTS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* 바우처 목록 */}
          {vouchers.length === 0 ? (
            <div className="text-center py-10 text-gray-500">검색 결과가 없습니다.</div>
          ) : (
            <div className="space-y-4">
              {vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{voucher.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="flex items-center gap-1">
                      <span>📍</span>
                      <span>
                        {voucher.area} - {voucher.sigunguName}
                      </span>
                    </p>
                    <p className="flex items-center gap-1">
                      <span>🏢</span>
                      <span>{voucher.facilityName}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <span>🏃</span>
                      <span>{voucher.sports}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <span>💰</span>
                      <span className="font-semibold text-blue-600">
                        {voucher.price.toLocaleString()}원
                      </span>
                    </p>
                    {voucher.telephone && (
                      <p className="flex items-center gap-1">
                        <span>📞</span>
                        <span>{voucher.telephone}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">{voucher.addr1}</p>
                    {voucher.addr2 && <p className="text-xs text-gray-500">{voucher.addr2}</p>}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">회원수: {voucher.memberCount}명</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:bg-gray-300 transition-colors"
              >
                이전
              </button>
              <span className="text-sm text-gray-600 px-4">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:bg-gray-300 transition-colors"
              >
                다음
              </button>
            </div>
          )}
        </>
      ) : (
        <div ref={mapRef} id="map" className="w-full h-[60vh]" />
      )}
    </div>
  );
};

export default VoucherContent;
