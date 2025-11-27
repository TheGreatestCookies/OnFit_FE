import Container from './Container';

interface ScreenProps {
  children: React.ReactNode;
}

/**
 * Screen 컴포넌트 - 전체 화면 배경
 * @param {React.ReactNode} children
 * @returns {JSX.Element}
 */
const Screen = ({ children }: ScreenProps) => {
  return (
    <div className="w-full min-h-screen bg-gray-50 flex justify-center">
      <Container>{children}</Container>
    </div>
  );
};

export default Screen;
