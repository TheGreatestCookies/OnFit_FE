import { Route, Routes as RouterRoutes } from 'react-router-dom';
import HomePage from '@/pages/Home/HomePage';
import { ROUTES_PATH } from '@/constants/routes';
import MyPage from '@/pages/My/MyPage';
import VoucherPage from '@/pages/Voucher/VoucherPage';
import CommunityPage from '@/pages/Community/CommunityPage';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '@/pages/Auth/LoginPage';
import SignupPage from '@/pages/Auth/SignupPage';
import { ROUTE_PATH } from '@/constants/RoutePath';

/**
 * Routes component
 * @returns {JSX.Element}
 */
const Routes = () => {
  return (
    <RouterRoutes>
      <Route path={ROUTES_PATH.HOME} element={<HomePage />} />
      <Route
        path={ROUTES_PATH.MY_PAGE}
        element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        }
      />
      <Route path={ROUTES_PATH.VOUCHER} element={<VoucherPage />} />
      <Route path={ROUTES_PATH.COMMUNITY} element={<CommunityPage />} />
      <Route path={ROUTE_PATH.LOGIN} element={<LoginPage />} />
      <Route path={ROUTE_PATH.SIGNUP} element={<SignupPage />} />
    </RouterRoutes>
  );
};

export default Routes;
