import { useState, useEffect } from 'react';
import useMediaUpload from '@/hooks/useMediaUpload';
import type { MediaInfo } from '@/types/Media/MediaInfo';
import type { Post } from '@/api/community';
import { toast } from 'react-toastify';

interface PostEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onUpdate: (postId: number, content: string, mediaInfos: MediaInfo[]) => Promise<void>;
}

const PostEditModal = ({ isOpen, onClose, post, onUpdate }: PostEditModalProps) => {
  const [content, setContent] = useState(post.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    imageInfos,
    setImageInfos,
    imagePreviews,
    isUploading,
    pickAndUploadImages,
    removeImage,
  } = useMediaUpload({ maxImages: 10 });

  // 기존 이미지 URL을 MediaInfo 형태로 변환
  useEffect(() => {
    if (post.imageUrls && post.imageUrls.length > 0) {
      const existingImages: MediaInfo[] = post.imageUrls.map((url, index) => ({
        id: index,
        presignedUrl: url,
      }));
      setImageInfos(existingImages);
    }
  }, [post.imageUrls, setImageInfos]);

  const handleClose = () => {
    setContent(post.content);
    onClose();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      toast.error('내용을 입력해주세요.');
      return;
    }

    if (trimmedContent.length < 10) {
      toast.error('내용은 최소 10글자 이상 입력해주세요.');
      return;
    }

    if (trimmedContent.length > 200) {
      toast.error('내용은 최대 200글자까지 입력 가능합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdate(post.id, trimmedContent, imageInfos);
      toast.success('게시글이 수정되었습니다.');
      handleClose();
    } catch (error) {
      console.error('글 수정 실패:', error);
      toast.error('글 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">글 수정</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleUpdate} className="p-4">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 운동의 기록을 공유해주세요! (최소 10자)"
              className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              disabled={isSubmitting}
              maxLength={200}
            />
            <div className="mt-1 text-right">
              <span className={`text-sm ${
                content.trim().length < 10 
                  ? 'text-red-500' 
                  : content.trim().length > 200 
                  ? 'text-red-500' 
                  : 'text-gray-500'
              }`}>
                {content.trim().length}/200자 (최소 10자)
              </span>
            </div>
          </div>

          {/* 이미지 프리뷰 */}
          {imagePreviews.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {imagePreviews.map((url, index) => (
                <div key={index} className="relative flex-shrink-0 w-20 h-20">
                  <img
                    src={url}
                    alt={`preview-${index}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700"
                    disabled={isSubmitting}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 이미지 업로드 버튼 */}
          <div className="mt-4">
            <label className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={pickAndUploadImages}
                disabled={isSubmitting || isUploading}
              />
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? '수정 중...' : isUploading ? '업로드 중...' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEditModal;

