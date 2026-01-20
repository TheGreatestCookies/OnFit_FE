import type { Voucher, Video } from '@/types/ChatType';
import VoucherCard from '@/pages/Voucher/components/VoucherCard';

interface RecommendationCardProps {
  type: 'recommend' | 'home_workout';
  vouchers?: Voucher[];
  videos?: Video[];
  onLike?: (voucherId: number) => void;
  onUnlike?: (voucherId: number) => void;
}

const RecommendationCard = ({ type, vouchers, videos, onLike, onUnlike }: RecommendationCardProps) => {
  if (type === 'recommend' && vouchers) {
    return (
      <div className="flex flex-col gap-2 mt-2 w-full">
        {vouchers.map((voucher) => (
          <VoucherCard
            key={voucher.id}
            voucher={{
              ...voucher,
              // Map missing fields with default values / correct like info
              area: '',
              areaCode: 0,
              sports: voucher.category, // Map category to sports
              sportsCode: 0,
              sigunguCode: 0,
              sigunguName: '',
              addr1: '', // Chat API might not return full address
              addr2: '',
              zipCode: '',
              memberCount: 0,
              latitude: 0,
              longitude: 0,
              likeCnt: voucher.likeCnt ?? (voucher as any).likeCount ?? 0,
              myLike: voucher.myLike ?? false,
            }}
            onLike={onLike}
            onUnlike={onUnlike}
          />
        ))}
      </div>
    );
  }

  if (type === 'home_workout' && videos) {
    return (
      <div className="flex flex-col gap-2 mt-2 w-full">
        {videos.map((video, index) => (
          <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <h4 className="font-bold text-sm text-gray-800 mb-2">{video.title}</h4>
            <div className="relative pt-[56.25%] w-full bg-black rounded-md overflow-hidden">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${video.youtubeCode}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default RecommendationCard;
