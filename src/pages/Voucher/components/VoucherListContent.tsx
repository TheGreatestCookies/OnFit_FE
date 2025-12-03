import type { VoucherItem } from '@/api/voucher';
import type { FilterProps } from '@/types/voucher';

interface VoucherListContentProps {
  vouchers: VoucherItem[];
  filterProps: FilterProps;
}

const VoucherListContent = ({ vouchers, filterProps }: VoucherListContentProps) => {
  const {
    area,
    sports,
    setArea,
    setSports,
    page,
    setPage,
    totalPages,
    areaOptions,
    sportsOptions,
  } = filterProps;
  return (
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
          {areaOptions.map((option) => (
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
          {sportsOptions.map((option) => (
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
              className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <button
                className="absolute top-4 right-4 p-1 z-10 hover:scale-110 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  // 추후 좋아요 기능 구현
                }}
              >
                <img src="/icons/heart-empty.svg" alt="찜하기" className="w-6 h-6" />
              </button>
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
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:bg-gray-300 transition-colors"
          >
            이전
          </button>
          <span className="text-sm text-gray-600 px-4">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:bg-gray-300 transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </>
  );
};

export default VoucherListContent;
