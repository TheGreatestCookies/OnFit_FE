import IconName from '@/constants/IconName';
import LogoIcon from '@/components/icon/LogoIcon';

const Header = () => {
  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-16 bg-white border-b border-gray-200 z-10">
      <div className="w-full h-full flex items-center justify-center gap-2 pr-4">
        <LogoIcon src={IconName.LOGO2} alt={IconName.LOGO2} />
        <h1 className="text-2xl font-bold">MaumFit</h1>
      </div>
    </div>
  );
};

export default Header;
