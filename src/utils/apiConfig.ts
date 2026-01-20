// API Base URL 설정
// 개발 환경: Vite 프록시 사용 (빈 문자열 = 상대 경로)
// 프로덕션: 환경 변수에서 백엔드 서버 URL 가져오기
// 환경변수가 비어 있고 호스트가 maumfit.co.kr인 경우 api 서브도메인으로 강제 설정
const inferBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('maumfit.co.kr')) {
      return 'https://api.maumfit.co.kr';
    }
  }
  return '';
};

export const API_BASE_URL = inferBaseUrl();

