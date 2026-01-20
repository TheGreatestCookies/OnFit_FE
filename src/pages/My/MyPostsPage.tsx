import Header from '@/components/common/Header';
import MyPostsContent from '@/pages/My/components/MyPostsContent';
import Screen from '@/components/common/Screen';
import Footer from '@/components/common/Footer';

const MyPostsPage = () => {
  return (
    <Screen>
      <Header />
      <MyPostsContent />
      <Footer />
    </Screen>
  );
};

export default MyPostsPage;

