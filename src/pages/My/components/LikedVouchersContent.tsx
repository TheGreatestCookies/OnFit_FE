import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { fetchLikedVouchers, likeVoucher, unlikeVoucher } from '@/api/voucher';
import VoucherCard from '@/pages/Voucher/components/VoucherCard';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import type { VoucherItem } from '@/api/voucher';

const LikedVouchersContent = () => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [likingVoucherIds, setLikingVoucherIds] = useState<Set<number>>(new Set());

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['likedVouchers'],
    queryFn: ({ pageParam = 0 }) => fetchLikedVouchers(pageParam, 10),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.number + 1;
    },
  });

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, fetchNextPage]);

  // 좋아요 추가 (낙관적 업데이트)
  const handleLike = async (voucherId: number) => {
    // 중복 클릭 방지
    if (likingVoucherIds.has(voucherId)) {
      return;
    }

    setLikingVoucherIds((prev) => new Set(prev).add(voucherId));

    // 원래 값 저장 (롤백용)
    let originalVoucher: VoucherItem | null = null;
    queryClient.setQueryData(['likedVouchers'], (oldData: any) => {
      if (!oldData) return oldData;

      // 원래 바우처 찾기
      for (const page of oldData.pages) {
        const found = page.content.find((voucher: VoucherItem) => voucher.id === voucherId);
        if (found) {
          originalVoucher = found;
          break;
        }
      }

      // 낙관적 업데이트: UI를 먼저 업데이트
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          content: page.content.map((voucher: VoucherItem) =>
            voucher.id === voucherId
              ? { ...voucher, myLike: true, likeCnt: voucher.likeCnt + 1 }
              : voucher,
          ),
        })),
      };
    });

    try {
      await likeVoucher(voucherId);
      // 성공 시 서버 데이터로 동기화
      await queryClient.invalidateQueries({ queryKey: ['likedVouchers'] });
    } catch (error) {
      // 실패 시 롤백 (원래 값으로 복원)
      if (originalVoucher) {
        queryClient.setQueryData(['likedVouchers'], (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              content: page.content.map((voucher: VoucherItem) =>
                voucher.id === voucherId ? originalVoucher! : voucher,
              ),
            })),
          };
        });
      }
      console.error('좋아요 실패:', error);
      toast.error('좋아요에 실패했습니다.');
    } finally {
      setLikingVoucherIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(voucherId);
        return newSet;
      });
    }
  };

  // 좋아요 취소 (낙관적 업데이트)
  const handleUnlike = async (voucherId: number) => {
    // 중복 클릭 방지
    if (likingVoucherIds.has(voucherId)) {
      return;
    }

    setLikingVoucherIds((prev) => new Set(prev).add(voucherId));

    // 원래 값 저장 (롤백용)
    let originalVoucher: VoucherItem | null = null;
    queryClient.setQueryData(['likedVouchers'], (oldData: any) => {
      if (!oldData) return oldData;

      // 원래 바우처 찾기
      for (const page of oldData.pages) {
        const found = page.content.find((voucher: VoucherItem) => voucher.id === voucherId);
        if (found) {
          originalVoucher = found;
          break;
        }
      }

      // 낙관적 업데이트: UI를 먼저 업데이트
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          content: page.content.map((voucher: VoucherItem) =>
            voucher.id === voucherId
              ? { ...voucher, myLike: false, likeCnt: Math.max(0, voucher.likeCnt - 1) }
              : voucher,
          ),
        })),
      };
    });

    try {
      await unlikeVoucher(voucherId);
      // 성공 시 서버 데이터로 동기화
      await queryClient.invalidateQueries({ queryKey: ['likedVouchers'] });
    } catch (error) {
      // 실패 시 롤백 (원래 값으로 복원)
      if (originalVoucher) {
        queryClient.setQueryData(['likedVouchers'], (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              content: page.content.map((voucher: VoucherItem) =>
                voucher.id === voucherId ? originalVoucher! : voucher,
              ),
            })),
          };
        });
      }
      console.error('좋아요 취소 실패:', error);
      toast.error('좋아요 취소에 실패했습니다.');
    } finally {
      setLikingVoucherIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(voucherId);
        return newSet;
      });
    }
  };

  return (
    <div className="absolute top-16 bottom-16 left-0 right-0 w-full overflow-y-auto px-4 py-6 bg-gray-0">
      <div className="max-w-md mx-auto">
        {status === 'pending' ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : status === 'error' ? (
          <div className="text-center py-10 text-gray-500">바우처를 불러오는데 실패했습니다.</div>
        ) : (
          <>
            {data?.pages.map((page) =>
              page.content.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  isLiking={likingVoucherIds.has(voucher.id)}
                />
              )),
            )}
            {data?.pages[0].content.length === 0 && (
              <div className="text-center py-20 text-gray-400">좋아요한 바우처가 없습니다.</div>
            )}
          </>
        )}

        {/* Infinite Scroll Sentinel */}
        <div ref={loadMoreRef} className="h-10 flex justify-center items-center">
          {isFetchingNextPage && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          )}
        </div>
      </div>
    </div>
  );
};

export default LikedVouchersContent;

