
const HomeContent = ({ image }: { image: string }) => {
  return (
    <div className="w-full h-full">
      <img 
        src={image} 
        alt="home" 
        className="w-full h-full object-cover" 
      />
    </div>
  );
};

export default HomeContent;