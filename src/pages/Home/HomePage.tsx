import HomeContent from '@/pages/Home/components/HomeContent';
import Screen from '@/components/common/Screen';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
/**
 * Home page component
 * @returns {JSX.Element}
 */
const HomePage = () => {
  return (
    <Screen>
      <Header />
      <HomeContent image="/home.png" />
      <Footer />
    </Screen>
  );
};

export default HomePage;
