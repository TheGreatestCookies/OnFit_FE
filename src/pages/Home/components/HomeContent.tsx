import IconName from '@/constants/IconName';
import CharacterIcon from '@/components/icon/CharacterIcon';
const HomeContent = ({ image }: { image: string }) => {
  const position = {
    top: 40,
    left: 40,
  };
  return (
    <div className="absolute top-16 bottom-16 left-0 right-0 w-full overflow-hidden">
      <img src={image} alt="home" className="w-full h-full object-cover" />
      <div className="absolute top-0 left-0 right-0 w-full h-full pointer-events-none">
        <CharacterIcon
          src={IconName.TIGER}
          alt={IconName.TIGER}
          size={240}
          className="absolute pointer-events-auto hover:scale-110 transition-transform duration-300 cursor-pointer"
          style={{ top: `${position.top}%`, left: `${position.left}%` }}
        />
      </div>
    </div>
  );
};

export default HomeContent;
