import Header from '@/components/common/Header';
import VoucherContent from '@/pages/Voucher/components/VoucherContent';
import Screen from '@/components/common/Screen';
import Footer from '@/components/common/Footer';
/**
 * Voucher page component
 * @returns {JSX.Element}
 */
const VoucherPage = () => {
  return (
    <Screen>
      <Header />
      <VoucherContent />
      <Footer />
    </Screen>
  );
};

export default VoucherPage;
