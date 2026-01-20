import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { VoucherItem } from '@/api/voucher';
import type { FilterProps } from '@/types/voucher';
import { SPORTS_ICONS } from '@/constants/SportsIcons';
import LocationIcon from '@/components/icon/LocationIcon';
import FacilityIcon from '@/components/icon/FacilityIcon';
import Icon from '@/components/icon/Icon';
import IconName from '@/constants/IconName';
import { useAuth } from '@/context/AuthContext';

// 마커 데이터 타입
interface MarkerData {
  voucher: VoucherItem;
  lat: number;
  lng: number;
}

interface MarkerRef {
  marker: naver.maps.Marker;
  infoWindow: naver.maps.InfoWindow;
  voucher: VoucherItem;
}

interface VoucherMapContentProps {
  vouchers: VoucherItem[];
  onSwitchToList: () => void;
  filterProps: FilterProps;
  userLocation: { lat: number; lng: number } | null;
  onLike: (voucherId: number) => void;
  onUnlike: (voucherId: number) => void;
}

const VoucherMapContent = ({
  vouchers,
  filterProps,
  userLocation,
  onSwitchToList,
  onLike,
  onUnlike,
}: VoucherMapContentProps) => {
  const { area, sports, setArea, setSports, setPage, areaOptions, sportsOptions } = filterProps;
  const { userInfo } = useAuth();

  const handleLikeClick = (voucher: VoucherItem) => {
    if (!userInfo) return;
    if (voucher.myLike) {
      onUnlike(voucher.id);
    } else {
      onLike(voucher.id);
    }
  };

  // 지도 DOM 및 인스턴스 참조
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<MarkerRef[]>([]);

  // 지도 마커 관련 상태
  const [markerData, setMarkerData] = useState<MarkerData[]>([]);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);

  // 지도 중심 및 경계 상태 (Viewport Culling용)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);



  // 바텀시트 드래그 상태
  const SHEET_HEIGHT = 600;
  const EXPANDED_OFFSET = 0;
  const MIDDLE_OFFSET = 300;
  const COLLAPSED_OFFSET = 400;
  const [sheetOffset, setSheetOffset] = useState(MIDDLE_OFFSET);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const startOffset = useRef(0);

  // 좌표 캐시
  //const coordinateCache = useRef<Map<string, { lat: number; lng: number }>>(new Map());

  // 1. DB의 위도/경도를 사용하여 마커 데이터 생성 (지오코딩 불필요)
  useEffect(() => {
    if (vouchers.length > 0) {
      const validMarkers: MarkerData[] = vouchers
        .filter((voucher) => {
          // 위도/경도가 있고, 필터 조건에 맞는 항목만
          if (!voucher.latitude || !voucher.longitude) return false;
          if (sports && voucher.sports !== sports) return false;
          return true;
        })
        .map((voucher) => ({
          voucher,
          lat: voucher.latitude,
          lng: voucher.longitude,
        }));

      setMarkerData(validMarkers);
      setIsGeocodingLoading(false);
    } else {
      setMarkerData([]);
      setIsGeocodingLoading(false);
    }
  }, [vouchers, sports]);

  // 거리 계산 함수
  const getDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // 정렬된 데이터 (거리순)
  const sortedMarkerData = useMemo(() => {
    if (!mapCenter || markerData.length === 0) return markerData;

    return [...markerData].sort((a, b) => {
      const distA = getDistance(mapCenter.lat, mapCenter.lng, a.lat, a.lng);
      const distB = getDistance(mapCenter.lat, mapCenter.lng, b.lat, b.lng);
      return distA - distB;
    });
  }, [mapCenter, markerData, getDistance]);

  // 리스트 표시 데이터
  const displayList = sortedMarkerData.slice(0, 10);

  // 2. 지도 초기화 및 이벤트 리스너
  useEffect(() => {
    if (mapRef.current && window.naver?.maps && !mapInstanceRef.current) {
      const defaultCenter = new window.naver.maps.LatLng(37.5665, 126.978);
      const center = userLocation
        ? new window.naver.maps.LatLng(userLocation.lat, userLocation.lng)
        : defaultCenter;

      const mapOptions = {
        center: center,
        zoom: 13,
        scaleControl: false,
        logoControl: false,
        mapDataControl: false,
      };

      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      setMapCenter({ lat: center.lat(), lng: center.lng() });

      const idleListener = window.naver.maps.Event.addListener(map, 'idle', () => {
        const currentCenter = map.getCenter();
        setMapCenter({ lat: currentCenter.lat(), lng: currentCenter.lng() });
      });

      setTimeout(() => {
        window.naver.maps.Event.trigger(map, 'resize');
      }, 100);

      return () => {
        window.naver.maps.Event.removeListener(idleListener);
      };
    }
  }, [userLocation, getDistance]);

  // 3. 마커 렌더링 (효율적인 Diffing 적용)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || markerData.length === 0) return;

    // 모든 마커 표시 (Viewport Culling 제거)
    const visibleItems = markerData;


    // 1. 제거해야 할 마커 찾기 (현재 지도에 있지만, visibleItems에는 없는 것)
    const visibleIds = new Set(visibleItems.map((item) => item.voucher.id));
    const nextMarkers: MarkerRef[] = [];

    markersRef.current.forEach((m) => {
      if (!visibleIds.has(m.voucher.id)) {
        // 화면 밖으로 나간 마커 제거
        m.marker.setMap(null);
        if (m.infoWindow) m.infoWindow.close();
      } else {
        // 유지될 마커
        nextMarkers.push(m);
      }
    });

    // 2. 추가해야 할 마커 찾기 (visibleItems에 있지만, 현재 지도에는 없는 것)
    const existingIds = new Set(nextMarkers.map((m) => m.voucher.id));
    const toAdd = visibleItems.filter((item) => !existingIds.has(item.voucher.id));

    toAdd.forEach(({ voucher, lat, lng }) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(lat, lng),
        map: map,
        title: voucher.name,
        icon: {
          url: SPORTS_ICONS[voucher.sports] || SPORTS_ICONS['default'],
          size: new window.naver.maps.Size(44, 44),
          scaledSize: new window.naver.maps.Size(44, 44),
          origin: new window.naver.maps.Point(0, 0),
          anchor: new window.naver.maps.Point(22, 22),
        },
      });

      const infoWindowContent = `
          <div style="padding: 15px; min-width: 200px; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">${voucher.name}</h3>
            <p style="margin: 5px 0; font-size: 14px;">${voucher.sports}</p>
            <p style="margin: 5px 0; font-size: 14px;">${voucher.price.toLocaleString()}원</p>
            <p style="margin: 5px 0; font-size: 14px;">${voucher.sigunguName}</p>
            <p style="margin: 5px 0; font-size: 12px; color: #666;">${voucher.addr1}</p>
          </div>
        `;

      const infoWindow = new window.naver.maps.InfoWindow({
        content: infoWindowContent,
        backgroundColor: 'transparent',
        borderWidth: 0,
        disableAnchor: true,
        pixelOffset: new window.naver.maps.Point(0, -10),
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        setSelectedVoucherId(voucher.id);
        setSheetOffset(MIDDLE_OFFSET);

        markersRef.current.forEach((m) => {
          if (m.infoWindow && m.infoWindow !== infoWindow) {
            m.infoWindow.close();
          }
        });

        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(map, marker);
        }
      });

      nextMarkers.push({ marker, infoWindow, voucher });
    });

    // 참조 업데이트
    markersRef.current = nextMarkers;

    // cleanup (컴포넌트 언마운트 시에만 전체 제거)
    return () => {
      // 여기서는 아무것도 하지 않음.
      // useEffect 의존성이 변경될 때마다 cleanup이 실행되는데,
      // 우리는 diffing을 하므로 마커를 유지해야 함.
      // 진짜 언마운트 시점은 상위 컴포넌트에서 제어하거나,
      // 빈 배열 의존성을 가진 별도의 useEffect에서 처리해야 함.
    };
  }, [markerData]); // currentBounds 제거됨

  // 컴포넌트 언마운트 시 클린업
  useEffect(() => {
    return () => {
      markersRef.current.forEach(({ marker, infoWindow }) => {
        marker.setMap(null);
        if (infoWindow) infoWindow.close();
      });
      markersRef.current = [];
    };
  }, []);

  // 바텀시트 드래그 핸들러
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
    startOffset.current = sheetOffset;
    setIsDragging(true);

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (dragStartY.current === null) return;

      const moveClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const delta = moveClientY - dragStartY.current;
      const next = Math.min(
        COLLAPSED_OFFSET,
        Math.max(EXPANDED_OFFSET, startOffset.current + delta),
      );
      setSheetOffset(next);
    };

    const handleEnd = () => {
      setIsDragging(false);
      dragStartY.current = null;

      setSheetOffset((currentOffset) => {
        if (currentOffset < 150) return EXPANDED_OFFSET;
        if (currentOffset < 375) return MIDDLE_OFFSET;
        return COLLAPSED_OFFSET;
      });

      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
  };

  return (
    <div className="relative w-full h-full">
      {isGeocodingLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">지도 위치 정보를 불러오는 중...</p>
            <p className="text-sm text-gray-400 mt-2">
              ({markerData.length}/{vouchers.length} 완료)
            </p>
          </div>
        </div>
      ) : markerData.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">지도에 표시할 위치 정보가 없습니다.</p>
        </div>
      ) : null}



      {/* 지도 영역 */}
      <div
        ref={mapRef}
        id="map"
        className="w-full h-full rounded-lg shadow-lg border border-gray-200 z-1"
      />

      {/* 상단 컨트롤 레이어 */}
      <div className="absolute top-3 left-3 right-3 z-20 space-y-2">
        <div className="flex gap-2">
          <select
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              setPage(0);
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-lg text-sm"
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-lg text-sm"
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
            onClick={onSwitchToList}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            리스트 뷰
          </button>
        </div>
      </div>
      </div>

      {/* 하단 바텀시트 레이어 */}
      <div className=" fixed left-1/2 -translate-x-1/2 bottom-0 z-20 flex justify-center pointer-events-none w-full max-w-[480px]">
        <div
          className={`w-full bg-white rounded-t-2xl shadow-xl pointer-events-auto border-2 border-gray-300 ${isDragging ? '' : 'transition-transform duration-200'
            }`}
          style={{
            transform: `translateY(${sheetOffset}px)`,
            height: `${SHEET_HEIGHT}px`,
          }}
        >
          {/* 드래그 핸들 */}
          <div
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            className="w-full flex flex-col items-center py-3 cursor-grab active:cursor-grabbing"
          >
            <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-2" />
            <p className="text-xs text-gray-400">
              {mapCenter ? '현 지도 중심 가까운 10곳' : '목록'}
            </p>
          </div>

          {/* 바우처 카드 리스트 */}
          <div className="px-4 pb-4 overflow-y-auto" style={{ height: 'calc(100% - 40px)' }}>
            {displayList.length > 0 ? (
              <div className="space-y-3">
                {displayList.map(({ voucher, lat, lng }) => {
                  const isSelected = selectedVoucherId === voucher.id;
                  const dist = mapCenter
                    ? getDistance(mapCenter.lat, mapCenter.lng, lat, lng).toFixed(1)
                    : null;

                  return (
                    <div
                      key={voucher.id}
                      onClick={() => {
                        setSelectedVoucherId(voucher.id);
                        const map = mapInstanceRef.current;
                        if (map) {
                          map.morph(new window.naver.maps.LatLng(lat, lng), 14);
                          const targetMarker = markersRef.current.find(
                            (m) => m.voucher.id === voucher.id,
                          );
                          if (targetMarker) {
                            markersRef.current.forEach((m) => {
                              if (m.infoWindow && m.voucher.id !== voucher.id) {
                                m.infoWindow.close();
                              }
                            });
                            targetMarker.infoWindow.open(map, targetMarker.marker);
                          }
                        }
                        setSheetOffset(MIDDLE_OFFSET);
                      }}
                      className={`relative rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${isSelected
                        ? 'bg-gray-50 border-2 border-red-500'
                        : 'bg-gray-50 border border-gray-200'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3
                          className={`font-bold text-lg ${isSelected ? 'text-red-600' : 'text-gray-800'}`}
                        >
                          {voucher.name}
                        </h3>
                        <div className="flex flex-col items-end gap-1">
                          {dist && (
                            <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-1 rounded-full">
                              {dist}km
                            </span>
                          )}
                          <button
                            className={`p-1 hover:scale-110 transition-transform ${!userInfo ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        </div>
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
                          <span
                            className={`font-semibold ${isSelected ? 'text-red-600' : 'text-blue-600'}`}
                          >
                            {voucher.price.toLocaleString()}원
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">{voucher.addr1}</p>
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
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                표시할 바우처가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherMapContent;
