import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMyPosts, deletePost, updatePost } from '@/api/community';
import PostCard from '@/pages/Community/components/PostCard';
import PostEditModal from '@/pages/Community/components/PostEditModal';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import type { Post } from '@/api/community';
import type { MediaInfo } from '@/types/Media/MediaInfo';
import ConfirmModal from '@/components/ConfirmModal';

const MyPostsContent = () => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['myPosts'],
    queryFn: ({ pageParam = 0 }) => fetchMyPosts(pageParam, 10),
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

  const handleEditClick = (post: Post) => {
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handlePostUpdate = async (postId: number, content: string, mediaInfos: MediaInfo[]) => {
    const imagesUrls = mediaInfos.map((info) => info.presignedUrl);
    await updatePost(postId, { content, imagesUrls });
    await queryClient.invalidateQueries({ queryKey: ['myPosts'] });
    await queryClient.invalidateQueries({ queryKey: ['posts'] });
    toast.success('게시글이 수정되었습니다.');
  };

  const handleDeleteClick = (postId: number) => {
    setDeleteTargetId(postId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId === null) return;

    setIsDeleteConfirmOpen(false);

    try {
      await deletePost(deleteTargetId);
      await queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
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
        {/* 헤더 */}


        {/* 내용 */}
        <div>
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
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                )),
              )}
              {data?.pages[0].content.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium mb-2">작성한 게시글이 없습니다</p>
                  <p className="text-sm">커뮤니티에서 첫 게시글을 작성해보세요!</p>
                </div>
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

      {/* 글 수정 모달 */}
      {selectedPost && (
        <PostEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          post={selectedPost}
          onUpdate={handlePostUpdate}
        />
      )}

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

export default MyPostsContent;

