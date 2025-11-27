interface ContainerProps {
  children: React.ReactNode;
}

/**
 * Container 컴포넌트 - 480px 콘텐츠 영역
 * @param {React.ReactNode} children
 * @returns {JSX.Element}
 */
const Container = ({ children }: ContainerProps) => {
  return <div className="w-full max-w-[480px] min-h-screen bg-white shadow-lg">{children}</div>;
};

export default Container;
