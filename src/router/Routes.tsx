import { Route, Routes as RouterRoutes } from 'react-router-dom';
import Home from '@/pages/Home';
/**
 * Routes component
 * @returns {JSX.Element}
 */
const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Home />} />
    </RouterRoutes>
  );
};

export default Routes;
