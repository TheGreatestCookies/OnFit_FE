import Header from '@/components/common/Header';
import MyContent from '@/pages/My/components/MyContent';
import Screen from '@/components/common/Screen';
import Footer from '@/components/common/Footer';

const MyPage = () => {
  return (
    <Screen>
      <Header />
      <MyContent />
      <Footer />
    </Screen>
  );
};

export default MyPage;
