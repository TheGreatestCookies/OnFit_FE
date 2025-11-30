import ReactIcon from '@/components/icon/ReactIcon';
const Footer = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full h-16 bg-white border-t border-gray-200 z-10">
      <div className="w-full h-full flex items-center justify-around px-4">
        <ReactIcon />
        <ReactIcon />
        <ReactIcon />
        <ReactIcon />
        <ReactIcon />
      </div>
    </div>
  );
};

export default Footer;
