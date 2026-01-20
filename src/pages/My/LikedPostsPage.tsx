import Header from '@/components/common/Header';
import LikedPostsContent from '@/pages/My/components/LikedPostsContent';
import Screen from '@/components/common/Screen';
import Footer from '@/components/common/Footer';

const LikedPostsPage = () => {
  return (
    <Screen>
      <Header />
      <LikedPostsContent />
      <Footer />
    </Screen>
  );
};

export default LikedPostsPage;

