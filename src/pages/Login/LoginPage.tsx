import LoginContent from '@/pages/Login/component/LoginContent';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Screen from '@/components/common/Screen';
const LoginPage = () => {
    return (
        <>
            <Screen>
                <Header />
                <LoginContent />
                <Footer />
            </Screen>
        </>
    );
};
export default LoginPage;
