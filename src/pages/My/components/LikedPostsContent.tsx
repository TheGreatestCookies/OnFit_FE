import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { fetchLikedPosts, deletePost } from '@/api/community';
import PostCard from '@/pages/Community/components/PostCard';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ConfirmModal';

const LikedPostsContent = () => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['likedPosts'],
    queryFn: ({ pageParam = 0 }) => fetchLikedPosts(pageParam, 10),
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

  const handleDeleteClick = (postId: number) => {
    setDeleteTargetId(postId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId === null) return;

    setIsDeleteConfirmOpen(false);

    try {
      await deletePost(deleteTargetId);
      await queryClient.invalidateQueries({ queryKey: ['likedPosts'] });
      toast.success('게시글이 삭제되었습니다.');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      toast.error('게시글 삭제에 실패했습니다.');
    } finally {
      setDeleteTargetId(null);
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
          <div className="text-center py-10 text-gray-500">게시글을 불러오는데 실패했습니다.</div>
        ) : (
          <>
            {data?.pages.map((page) =>
              page.content.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handleDeleteClick}
                />
              )),
            )}
            {data?.pages[0].content.length === 0 && (
              <div className="text-center py-20 text-gray-400">좋아요한 게시글이 없습니다.</div>
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

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="게시글 삭제"
        message="정말로 이 게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        isDanger={true}
      />
    </div>
  );
};

export default LikedPostsContent;

