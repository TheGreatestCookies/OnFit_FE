import { Route, Routes as RouterRoutes } from 'react-router-dom';
import HomePage from '@/pages/Home/HomePage';
import { ROUTES_PATH } from '@/constants/routes';
import MyPage from '@/pages/My/MyPage';
import VoucherPage from '@/pages/Voucher/VoucherPage';
import CommunityPage from '@/pages/Community/CommunityPage';
/**
 * Routes component
 * @returns {JSX.Element}
 */
const Routes = () => {
  return (
    <RouterRoutes>
      <Route path={ROUTES_PATH.HOME} element={<HomePage />} />
      <Route path={ROUTES_PATH.MY_PAGE} element={<MyPage />} />
      <Route path={ROUTES_PATH.VOUCHER} element={<VoucherPage />} />
      <Route path={ROUTES_PATH.COMMUNITY} element={<CommunityPage />} />
    </RouterRoutes>
  );
};

export default Routes;
