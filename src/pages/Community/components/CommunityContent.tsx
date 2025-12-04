import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPosts, createPost } from '@/api/community';
import PostCard from './PostCard';
import PostWriteModal from './PostWriteModal';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '@/constants/RoutePath';

const CommunityContent = () => {
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
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

  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleFabClick = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 기능입니다.');
      navigate(ROUTE_PATH.LOGIN);
      return;
    }
    setIsFabExpanded(!isFabExpanded);
  };

  const handleWriteClick = () => {
    setIsFabExpanded(false);
    setIsWriteModalOpen(true);
  };

  const handlePostSubmit = async (content: string) => {
    await createPost({ content });
    // 게시글 목록 새로고침
    await queryClient.invalidateQueries({ queryKey: ['posts'] });
    alert('게시글이 작성되었습니다.');
  };

  return (
    <div className="absolute top-16 bottom-16 left-0 right-0 w-full overflow-y-auto bg-gray-50">
      <div className="px-4 py-6 max-w-md mx-auto">
        {status === 'pending' ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : status === 'error' ? (
          <div className="text-center py-10 text-gray-500">게시글을 불러오는데 실패했습니다.</div>
        ) : (
          <>
            {data?.pages.map((page) =>
              page.content.map((post) => <PostCard key={post.id} post={post} />),
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

      {/* Floating Action Button */}
      <div className="fixed bottom-24 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-md mx-auto px-4 flex justify-end">
          <div className="pointer-events-auto flex flex-col items-end gap-3">
            {isFabExpanded && (
              <div className="flex flex-col gap-3 animate-fade-in-up mb-2">
                <button
                  onClick={handleWriteClick}
                  className="bg-white text-gray-700 px-4 py-2 rounded-full shadow-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <span>✏️</span> 글 작성
                </button>
              </div>
            )}

            <button
              onClick={handleFabClick}
              className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:bg-red-300 ${isFabExpanded ? 'bg-gray-700 rotate-45' : 'bg-red-300 hover:bg-red-600'
                }`}
            >
              <span className="text-white text-2xl font-light">+</span>
            </button>
          </div>
        </div>
      </div>

      {/* 글 작성 모달 */}
      <PostWriteModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        onSubmit={handlePostSubmit}
      />
    </div>
  );
};

export default CommunityContent;
