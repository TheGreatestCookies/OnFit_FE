import Icon from "@/components/icon/Icon";
import icon from "@/assets/react.svg";
const Header = () => {
  return (
    <div className="w-full h-16 bg-white">
      <div className="w-full h-full flex items-center justify-center">
        <h1 className="text-2xl font-bold">OnFit</h1>
        <Icon src={icon} alt="logo" size={24} />
      </div>
    </div>
  );
};

export default Header;