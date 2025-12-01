interface CharacterIconProps {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Icon 컴포넌트 - SVG/이미지 아이콘을 감싸는 컴포넌트
 * @param src - 아이콘 이미지 경로
 * @param alt - 대체 텍스트
 * @param size - 아이콘 크기 (px)
 * @param className - 추가 CSS 클래스
 */
const CharacterIcon = ({
  src,
  alt = 'icon',
  size = 24,
  className = '',
  style,
}: CharacterIconProps) => {
  const iconPath = `/characters/${src.charAt(0) + src.slice(1)}.svg`;
  return (
    <img
      src={iconPath}
      alt={alt}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={style}
    />
  );
};

export default CharacterIcon;
