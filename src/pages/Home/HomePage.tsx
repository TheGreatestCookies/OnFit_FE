import HomeContent from '@/pages/Home/components/HomeContent';
import Screen from '@/components/common/Screen';
import Header from '@/components/common/Header';
/**
 * Home page component
 * @returns {JSX.Element}
 */
const HomePage = () => {
  return (
    <Screen>
      <Header />
      <HomeContent />
    </Screen>
  );
};

export default HomePage;
