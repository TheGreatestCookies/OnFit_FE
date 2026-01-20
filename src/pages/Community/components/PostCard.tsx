import { useState, useEffect } from 'react';
import type { Post } from '@/api/community';
import { useAuth } from '@/context/AuthContext';
import { FaceOptions } from '@/constants/FaceOptions';
import CharacterIcon from '@/components/icon/CharacterIcon';
import { likePost, unlikePost } from '@/api/community';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: number) => void;
}

const PostCard = ({ post, onEdit, onDelete }: PostCardProps) => {
  const { userInfo } = useAuth();
  const isMyPost = userInfo && userInfo.id === post.userId;
  const [isLiked, setIsLiked] = useState(post.myLike);
  const [likeCount, setLikeCount] = useState(post.likeCnt);
  const queryClient = useQueryClient();

  // post가 변경될 때 상태 동기화
  useEffect(() => {
    setIsLiked(post.myLike);
    setLikeCount(post.likeCnt);
  }, [post.myLike, post.likeCnt]);

  const { mutate: likePostMutation } = useMutation({
    mutationFn: () => likePost(post.id),
    onSuccess: () => {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: () => {
      setIsLiked(false);
    },
  });

  const { mutate: unlikePostMutation } = useMutation({
    mutationFn: () => unlikePost(post.id),
    onSuccess: () => {
      setIsLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: () => {
      setIsLiked(true);
    },
  });

  const handleLikeClick = () => {
    if (!userInfo) {
      return;
    }
    if (isLiked) {
      unlikePostMutation();
    } else {
      likePostMutation();
    }
  };

  const formattedDate = new Date(post.createdTime).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 hover:scale-[1.01] duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <CharacterIcon
            src={FaceOptions[(post.profileImageNumber || 1) - 1].src}
            alt={post.userName}
            size={40}
          />
          <div>
            <h3 className="font-bold text-gray-900">{post.userName}</h3>
            <p className="text-xs text-gray-500">{formattedDate}</p>
          </div>
        </div>

        {/* 수정/삭제 버튼 (내 글일 때만) */}
        {isMyPost && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(post)}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                수정
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(post.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
              >
                삭제
              </button>
            )}
          </div>
        )}
      </div>

    

      {post.imageUrls && post.imageUrls.length > 0 && (
        <div
          className={`grid gap-2 mb-4 ${post.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
        >
          {post.imageUrls.map((url, index) => (
            <div key={index} className="rounded-lg overflow-hidden aspect-square bg-gray-100">
              <img
                src={url}
                alt={`Post image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
  <p className="text-gray-800 whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>
      {/* 좋아요 버튼 */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={handleLikeClick}
          disabled={!userInfo}
          className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            } ${!userInfo ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg
            className="w-6 h-6"
            fill={isLiked ? 'currentColor' : 'none'}
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
          <span className="text-sm font-medium">{likeCount}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
