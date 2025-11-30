import Header from '@/components/common/Header';
import CommunityContent from '@/pages/Community/components/CommunityContent';
import Screen from '@/components/common/Screen';
import Footer from '@/components/common/Footer';

const CommunityPage = () => {
  return (
    <Screen>
      <Header />
      <CommunityContent />
      <Footer />
    </Screen>
  );
};

export default CommunityPage;
