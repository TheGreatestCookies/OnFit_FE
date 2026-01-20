import { useEffect, useRef } from 'react';
import type { VoucherItem } from '@/api/voucher';
import type { FilterProps } from '@/types/voucher';
import LocationIcon from '@/components/icon/LocationIcon';
import FacilityIcon from '@/components/icon/FacilityIcon';
import Icon from '@/components/icon/Icon';
import { SPORTS_ICONS } from '@/constants/SportsIcons';
import IconName from '@/constants/IconName';
import { useAuth } from '@/context/AuthContext';

interface VoucherListContentProps {
  vouchers: VoucherItem[];
  filterProps: Omit<FilterProps, 'page' | 'setPage' | 'totalPages'>;
  onSwitchToMap: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  onLike: (voucherId: number) => void;
  onUnlike: (voucherId: number) => void;
}

const VoucherListContent = ({
  vouchers,
  filterProps,
  onSwitchToMap,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  onLike,
  onUnlike,
}: VoucherListContentProps) => {
  const { area, sports, setArea, setSports, areaOptions, sportsOptions } = filterProps;
  const { userInfo } = useAuth();

  const handleLikeClick = (voucher: VoucherItem) => {
    if (!userInfo) return;
    if (voucher.myLike) {
      onUnlike(voucher.id);
    } else {
      onLike(voucher.id);
    }
  };

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <div className="px-4 bg-white">
        {/* 필터 영역 */}
        <div className="mb-4 space-y-2 pt-4">
          <div className="flex gap-2">
            <select
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-lg text-sm"
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
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-lg text-sm"
            >
              <option value="">전체 종목</option>
              {sportsOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <div className="flex justify-end">
              <button
                onClick={onSwitchToMap}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                지도 뷰
              </button>
            </div>
          </div>
        </div>

        {/* 바우처 목록 */}
        {vouchers.length === 0 ? (
          <div className="text-center py-10 text-gray-500">검색 결과가 없습니다.</div>
        ) : (
          <div className="space-y-4 pb-4">
            {vouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <button
                  className={`absolute top-4 right-4 p-1 z-10 hover:scale-110 transition-transform ${!userInfo ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeClick(voucher);
                  }}
                  disabled={!userInfo}
                >
                  <svg
                    className={`w-6 h-6 ${voucher.myLike ? 'text-red-500' : 'text-gray-400'}`}
                    fill={voucher.myLike ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{voucher.name}</h3>
                  <img
                    src={SPORTS_ICONS[voucher.sports] || SPORTS_ICONS.default}
                    alt={voucher.sports}
                    className="w-6 h-6"
                  />
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center gap-1">
                    <LocationIcon className="w-4 h-4 text-red-500" />
                    <span>
                      {voucher.area} - {voucher.sigunguName}
                    </span>
                  </p>
                  <p className="flex items-center gap-1">
                    <FacilityIcon className="w-4 h-4 text-gray-400" />
                    <span>{voucher.facilityName}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <Icon src={IconName.PERSON} size={16} />
                    <span>{voucher.sports}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <Icon src={IconName.MONEY} size={16} />
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
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">회원수: {voucher.memberCount}명</span>
                  <div className="flex items-center gap-1 text-red-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-xs font-medium">{voucher.likeCnt}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* 무한 스크롤 트리거 및 로딩 표시 */}
            <div ref={observerTarget} className="h-10 flex justify-center items-center">
              {isFetchingNextPage && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VoucherListContent;
