import type { VoucherItem } from '@/api/voucher';
import { useAuth } from '@/context/AuthContext';

interface VoucherCardProps {
  voucher: VoucherItem;
  onLike?: (voucherId: number) => void;
  onUnlike?: (voucherId: number) => void;
  isLiking?: boolean;
}

const VoucherCard = ({ voucher, onLike, onUnlike, isLiking = false }: VoucherCardProps) => {
  const { userInfo } = useAuth();

  const handleLikeClick = () => {
    if (!userInfo) {
      return;
    }
    if (voucher.myLike) {
      onUnlike?.(voucher.id);
    } else {
      onLike?.(voucher.id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3 cursor-pointer transform transition-transform duration-300 hover:scale-[1.02] will-change-transform">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-gray-900 flex-1">{voucher.name}</h3>
      </div>
      
      <div className="space-y-1 mb-3">
        <p className="text-sm text-gray-600">
          <span className="font-medium">시설:</span> {voucher.facilityName}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">종목:</span> {voucher.sports}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">주소:</span> {voucher.addr1}
        </p>
        {voucher.telephone && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">전화:</span> {voucher.telephone}
          </p>
        )}
        <p className="text-sm text-gray-600">
          <span className="font-medium">가격:</span> {voucher.price.toLocaleString()}원
        </p>
      </div>

      {/* 좋아요 버튼 */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={handleLikeClick}
          disabled={!userInfo || isLiking}
          className={`flex items-center gap-1 transition-colors ${
            voucher.myLike ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          } ${!userInfo || isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg
            className="w-6 h-6"
            fill={voucher.myLike ? 'currentColor' : 'none'}
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
          <span className="text-sm font-medium">{voucher.likeCnt}</span>
        </button>
      </div>
    </div>
  );
};

export default VoucherCard;
