const HomeContent = () => {
  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">OnFit</h1>
      <div className="bg-blue-500 h-[500px] rounded-lg flex items-center justify-center text-white text-xl">
        지도 영역
      </div>
      <div className="mt-4 space-y-2">
        <div className="bg-gray-200 h-20 rounded-lg"></div>
        <div className="bg-gray-200 h-20 rounded-lg"></div>
        <div className="bg-gray-200 h-20 rounded-lg"></div>
      </div>
    </div>
  );
};

export default HomeContent;