import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { VoucherItem } from '@/api/voucher';
import type { FilterProps } from '@/types/voucher';
import { SPORTS_ICONS } from '@/constants/SportsIcons';
import LocationIcon from '@/components/icon/LocationIcon';
import FacilityIcon from '@/components/icon/FacilityIcon';
import Icon from '@/components/icon/Icon';

// 마커 데이터 타입
interface MarkerData {
  voucher: VoucherItem;
  lat: number;
  lng: number;
}

interface VoucherMapContentProps {
  vouchers: VoucherItem[];
  onSwitchToList?: () => void;
  filterProps: FilterProps;
  userLocation: { lat: number; lng: number } | null;
}

const VoucherMapContent = ({ vouchers, filterProps, userLocation }: VoucherMapContentProps) => {
  const { area, sports, setArea, setSports, setPage, areaOptions, sportsOptions } = filterProps;

  // 지도 DOM 및 인스턴스 참조
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // 지도 마커 관련 상태
  const [markerData, setMarkerData] = useState<MarkerData[]>([]);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);

  // 지도 중심 및 경계 상태 (Viewport Culling용)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  // ⭐ 재검색 버튼 상태 관리
  const [showRefreshBtn, setShowRefreshBtn] = useState(false);
  const lastCenterRef = useRef<{ lat: number; lng: number } | null>(null);


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
  const coordinateCache = useRef<Map<string, { lat: number; lng: number }>>(new Map());

  // 1. 지오코딩 (배치 처리 + 점진적 로딩)
  useEffect(() => {
    if (vouchers.length > 0 && window.naver?.maps) {
      setMarkerData([]); // 기존 마커 초기화
      setIsGeocodingLoading(true);

      const fetchCoordinatesBatch = async () => {
        const results: MarkerData[] = [];
        const BATCH_SIZE = 5;
        const DELAY_MS = 300;

        const toProcess: VoucherItem[] = [];
        vouchers.forEach((voucher) => {
          if (!voucher.addr1) return;

          // 클라이언트 사이드 필터링 (API 응답 보완)
          if (sports && voucher.sports !== sports) {
            return;
          }

          if (coordinateCache.current.has(voucher.addr1)) {
            const cached = coordinateCache.current.get(voucher.addr1)!;
            results.push({ voucher, ...cached });
          } else {
            toProcess.push(voucher);
          }
        });

        // 캐시된 데이터 먼저 설정
        if (results.length > 0) {
          setMarkerData(results);
        }

        // 미캐시 항목 배치 처리
        for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
          const batch = toProcess.slice(i, i + BATCH_SIZE);

          const batchPromises = batch.map((voucher) => {
            return new Promise<MarkerData | null>((resolve) => {
              if (!window.naver?.maps?.Service) {
                resolve(null);
                return;
              }

              window.naver.maps.Service.geocode(
                { query: voucher.addr1 },
                function (status, response) {
                  if (
                    status === window.naver.maps.Service.Status.OK &&
                    response.v2.addresses.length > 0
                  ) {
                    const result = response.v2.addresses[0];
                    const coords = {
                      lat: parseFloat(result.y),
                      lng: parseFloat(result.x),
                    };
                    coordinateCache.current.set(voucher.addr1, coords);
                    resolve({ voucher, ...coords });
                  } else {
                    resolve(null);
                  }
                },
              );
            });
          });

          const batchResults = await Promise.all(batchPromises);
          const validBatchResults = batchResults.filter((r): r is MarkerData => r !== null);

          // 딜레이
          if (i + BATCH_SIZE < toProcess.length) {
            await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
          }

          // 점진적 업데이트: 중복 제거 후 추가
          setMarkerData((prev) => {
            const newItems = validBatchResults.filter(
              (newItem) => !prev.some((prevItem) => prevItem.voucher.id === newItem.voucher.id)
            );
            return [...prev, ...newItems];
          });
        }

        setIsGeocodingLoading(false);
      };

      fetchCoordinatesBatch();
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

  // ⭐ "이 지역에서 다시 검색" 버튼 핸들러
  const handleRefreshLocation = () => {
    const map = mapInstanceRef.current;
    if (!map || !window.naver?.maps?.Service) return;

    const center = map.getCenter() as any;

    // 1. 버튼 숨기고 현재 위치를 마지막 검색 위치로 갱신
    setShowRefreshBtn(false);
    lastCenterRef.current = { lat: center.lat(), lng: center.lng() };

    // 2. Reverse Geocoding: 좌표 -> 행정구역 명칭 변환
    window.naver.maps.Service.reverseGeocode({
      coords: center,
      orders: [
        window.naver.maps.Service.OrderType.ADDR,
        window.naver.maps.Service.OrderType.ROAD_ADDR
      ].join(',')
    }, (status, response) => {
      if (status !== window.naver.maps.Service.Status.OK) {
        return alert('주소 정보를 찾을 수 없습니다.');
      }

      const result = response.v2;
      if (result.address) {
        const area1 = result.results[0]?.region?.area1?.name; // 예: 서울특별시
        const area2 = result.results[0]?.region?.area2?.name; // 예: 강남구

        // 가장 구체적인 지역명(area2)이 존재하면 그걸로, 아니면 area1으로 검색 시도
        const targetArea = area2 || area1;

        if (targetArea) {
          console.log(`검색 지역 변경: ${area} -> ${targetArea}`);
          setArea(targetArea); // ⭐ 여기서 상위 컴포넌트의 필터를 변경 -> API 재호출 유도
          setPage(0); // 페이지 초기화
        }
      }
    });
  };

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
      lastCenterRef.current = { lat: center.lat(), lng: center.lng() };

      const idleListener = window.naver.maps.Event.addListener(map, 'idle', () => {
        const currentCenter = map.getCenter() as any;
        setMapCenter({ lat: currentCenter.lat(), lng: currentCenter.lng() });

        if (lastCenterRef.current) {
          const dist = getDistance(
            lastCenterRef.current.lat,
            lastCenterRef.current.lng,
            currentCenter.lat(),
            currentCenter.lng()
          );

          // 1km 이상 이동했을 때만 버튼 노출
          if (dist > 1.0) {
            setShowRefreshBtn(true);
          }
        }
      });

      setTimeout(() => {
        window.naver.maps.Event.trigger(map, 'resize');
      }, 100);

      return () => {
        window.naver.maps.Event.removeListener(idleListener);
      };
    }
  }, []);

  // 3. 마커 렌더링 (효율적인 Diffing 적용)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || markerData.length === 0) return;

    // 모든 마커 표시 (Viewport Culling 제거)
    const visibleItems = markerData;

    console.log(`📍 마커 렌더링: 전체 ${markerData.length}개 중 ${visibleItems.length}개 표시`);

    // 1. 제거해야 할 마커 찾기 (현재 지도에 있지만, visibleItems에는 없는 것)
    const visibleIds = new Set(visibleItems.map((item) => item.voucher.id));
    const nextMarkers: any[] = [];

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

      {/* ⭐ 재검색 플로팅 버튼 */}
      {showRefreshBtn && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 animate-bounce-in">
          <button
            onClick={handleRefreshLocation}
            className="flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-full shadow-lg border border-blue-100 hover:bg-blue-50 transition-all active:scale-95 font-bold text-sm"
          >
            <span className="text-lg">↻</span>
            이 지역에서 다시 검색
          </button>
        </div>
      )}

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
                  const dist = mapCenter ? getDistance(mapCenter.lat, mapCenter.lng, lat, lng).toFixed(1) : null;

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
                      <button
                        className="absolute top-4 right-4 p-1 z-10 hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <img src="/icons/heart-empty.svg" alt="찜하기" className="w-6 h-6" />
                      </button>

                      <div className="flex justify-between items-start">
                        <h3
                          className={`font-bold text-lg mb-2 ${isSelected ? 'text-red-600' : 'text-gray-800'}`}
                        >
                          {voucher.name}
                        </h3>
                        {dist && <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-1 rounded-full">{dist}km</span>}
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
                          <Icon src="person" size={16} />
                          <span>{voucher.sports}</span>
                        </p>
                        <p className="flex items-center gap-1">
                          <Icon src="money" size={16} />
                          <span
                            className={`font-semibold ${isSelected ? 'text-red-600' : 'text-blue-600'}`}
                          >
                            {voucher.price.toLocaleString()}원
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">{voucher.addr1}</p>
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
