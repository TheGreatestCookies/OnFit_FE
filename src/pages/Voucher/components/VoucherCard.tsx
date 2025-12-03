import type { VoucherItem } from '@/api/voucher';

interface VoucherCardProps {
  voucher: VoucherItem;
}

const VoucherCard = ({ voucher }: VoucherCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl max-h-56 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-h-56 overflow-y-auto">
        <h3>{voucher.name}</h3>
        <p>{voucher.addr1}</p>
      </div>
    </div>
  );
};

export default VoucherCard;
