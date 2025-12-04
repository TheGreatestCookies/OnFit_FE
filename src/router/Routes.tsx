import { Route, Routes as RouterRoutes } from 'react-router-dom';
import HomePage from '@/pages/Home/HomePage';
import MyPage from '@/pages/My/MyPage';
import VoucherPage from '@/pages/Voucher/VoucherPage';
import CommunityPage from '@/pages/Community/CommunityPage';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '@/pages/Login/LoginPage';
import SignUpPage from '@/pages/SignUp/SignUpPage';
import { ROUTE_PATH } from '@/constants/RoutePath';

/**
 * Routes component
 * @returns {JSX.Element}
 */
const Routes = () => {
  return (
    <RouterRoutes>
      <Route path={ROUTE_PATH.HOME} element={<HomePage />} />
      <Route
        path={ROUTE_PATH.MY_PAGE}
        element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        }
      />
      <Route path={ROUTE_PATH.VOUCHER} element={<VoucherPage />} />
      <Route path={ROUTE_PATH.COMMUNITY} element={<CommunityPage />} />
      <Route path={ROUTE_PATH.LOGIN} element={<LoginPage />} />
      <Route path={ROUTE_PATH.SIGNUP} element={<SignUpPage />} />
    </RouterRoutes>
  );
};

export default Routes;
