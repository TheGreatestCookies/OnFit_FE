import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES_PATH } from '@/constants/routes';
import Icon from '../icon/Icon';

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: 'home', label: '홈', path: ROUTES_PATH.HOME },
  { icon: 'voucher', label: '스포츠바우처', path: ROUTES_PATH.VOUCHER },
  { icon: 'community', label: '커뮤니티', path: ROUTES_PATH.COMMUNITY },
  { icon: 'my-page', label: '마이페이지', path: ROUTES_PATH.MY_PAGE },
];

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-16 bg-white border-t border-gray-200 z-10">
      <div className="w-full h-full flex items-center justify-around px-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                active ? 'text-black' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-6 h-6 transition-all ${active ? 'brightness-0' : 'brightness-0 opacity-40'}`}
              >
                <Icon src={item.icon} alt={item.icon} />
              </div>
              <span className={`text-xs ${active ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Footer;
