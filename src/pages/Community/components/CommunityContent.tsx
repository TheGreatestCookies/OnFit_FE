import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPosts, createPost, checkCanWritePost, updatePost, deletePost } from '@/api/community';
import type { Post } from '@/api/community';
import PostCard from './PostCard';
import PostWriteModal from './PostWriteModal';
import PostEditModal from './PostEditModal';
import ConfirmModal from '@/components/ConfirmModal';
import type { MediaInfo } from '@/types/Media/MediaInfo';
import { toast } from 'react-toastify';
import PencilIcon from '@/components/icon/PencilIcon';
import LogoIcon from '@/components/icon/LogoIcon';
import IconName from '@/constants/IconName';

const CommunityContent = () => {
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam, 10),
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

  const handleWriteClick = async () => {
    try {
      // 오늘 글 작성 가능 여부 확인
      const canWrite = await checkCanWritePost();

      if (canWrite) {
        // 글 작성 가능 - 작성 모달 열기
        setIsWriteModalOpen(true);
      } else {
        // 이미 글을 작성함 - 토스트 표시
        toast.info('오늘은 이미 글을 작성하셨습니다.');
      }
    } catch (error: any) {
      console.error('글 작성 가능 여부 확인 실패:', error);

      // 401 에러 (로그인 안 됨)
      if (error?.status === 401) {
        toast.error('로그인이 필요한 기능입니다.');
        return;
      }

      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handlePostSubmit = async (content: string, mediaInfos: MediaInfo[]) => {
    const imagesUrls = mediaInfos.map((info) => info.presignedUrl);
    await createPost({ content, imagesUrls, title: '새 게시글' }); // Title is required by API but not in UI, using default
    // 게시글 목록 새로고침
    await queryClient.invalidateQueries({ queryKey: ['posts'] });
    toast.success('게시글이 작성되었습니다.');
    // 성공 후 모달 닫기
    setIsWriteModalOpen(false);
  };

  const handleEditClick = (post: Post) => {
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handlePostUpdate = async (postId: number, content: string, mediaInfos: MediaInfo[]) => {
    const imagesUrls = mediaInfos.map((info) => info.presignedUrl);
    await updatePost(postId, { content, imagesUrls });
    // 게시글 목록 새로고침
    await queryClient.invalidateQueries({ queryKey: ['posts'] });
    // 토스트는 PostEditModal에서 표시
  };

  // PostCard에서 직접 삭제 (확인 모달 열기)
  const handleDeleteClick = (postId: number) => {
    setDeleteTargetId(postId);
    setIsDeleteConfirmOpen(true);
  };

  // 삭제 확인 후 실제 삭제
  const handleConfirmDelete = async () => {
    if (deleteTargetId === null) return;

    setIsDeleteConfirmOpen(false);

    try {
      await deletePost(deleteTargetId);
      // 게시글 목록 새로고침
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
    
    <div className="absolute top-16 bottom-16 left-0 right-0 w-full overflow-y-auto bg-gray-0">
      <div className="px-1 py-6 max-w-md mx-auto">
        {status === 'pending' ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : status === 'error' ? (
          <div className="text-center py-10 text-gray-500">게시글을 불러오는데 실패했습니다.</div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-gradient-to-r from-red-500 to-red-300 rounded-2xl shadow-lg text-white transform transition-all hover:scale-[1.01]">
              <div className="flex items-center gap-4">

                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <LogoIcon src={IconName.LOGO2} alt="logo" size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">오늘도 화이팅하세요!</h3>
                  <p className="text-blue-50 text-sm font-medium">
                    매일 꾸준히 글을 올리고 다른 사람들과 우리의 운동 기록을 공유해봐요!
                  </p>
                </div>
              </div>
            </div>
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
              <div className="text-center py-20 text-gray-400">아직 작성된 게시글이 없습니다.</div>
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

      {/* 글 작성 버튼 */}
      <div className="fixed bottom-24 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-md mx-auto px-4 flex justify-end">
          <button
            onClick={handleWriteClick}
            className="pointer-events-auto bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-xl font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105"
          >
            <PencilIcon className="w-5 h-5" /> 글 작성
          </button>
        </div>
      </div>

      {/* 글 작성 모달 */}
      <PostWriteModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        onSubmit={handlePostSubmit}
      />

      {/* 글 수정 모달 */}
      {selectedPost && (
        <PostEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPost(null);
          }}
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

export default CommunityContent;
