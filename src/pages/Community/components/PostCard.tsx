import type { Post } from '@/api/community';

interface PostCardProps {
    post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
    const formattedDate = new Date(post.createdTime).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    {post.profileImage ? (
                        <img src={post.profileImage} alt={post.userName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">{post.userName}</h3>
                    <p className="text-xs text-gray-500">{formattedDate}</p>
                </div>
            </div>

            <p className="text-gray-800 whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>

            {post.imageUrls && post.imageUrls.length > 0 && (
                <div className={`grid gap-2 mb-4 ${post.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {post.imageUrls.map((url, index) => (
                        <div key={index} className="rounded-lg overflow-hidden aspect-square bg-gray-100">
                            <img src={url} alt={`Post image ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostCard;
