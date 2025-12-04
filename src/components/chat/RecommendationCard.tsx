import type { Voucher, Video } from '@/types/ChatType';

interface RecommendationCardProps {
  type: 'recommend' | 'home_workout';
  vouchers?: Voucher[];
  videos?: Video[];
}

const RecommendationCard = ({ type, vouchers, videos }: RecommendationCardProps) => {
  if (type === 'recommend' && vouchers) {
    return (
      <div className="flex flex-col gap-2 mt-2 w-full">
        {vouchers.map((voucher) => (
          <div
            key={voucher.id}
            className="bg-white p-3 rounded-lg shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-sm text-gray-800">{voucher.name}</h4>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                {voucher.category}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{voucher.facilityName}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">{voucher.distance}km</span>
              <span className="text-sm font-semibold text-blue-600">
                {voucher.price.toLocaleString()}원
              </span>
            </div>
          </div>
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
