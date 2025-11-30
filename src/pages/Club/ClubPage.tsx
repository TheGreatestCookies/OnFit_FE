import Footer from '@/components/common/Footer';
import Header from '@/components/common/Header';
import ClubContent from '@/pages/Club/components/ClubContent';
import Screen from '@/components/common/Screen';

const ClubPage = () => {
  return (
    <Screen>
      <Header />
      <ClubContent />
      <Footer />
    </Screen>
  );
};

export default ClubPage;
