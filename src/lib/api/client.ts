import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15000,
});

const PUBLIC_PATHS = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/admin/sign-in',
  '/auth/admin/sign-up',
  '/auth/check-email',
  '/auth/refresh',
];

apiClient.interceptors.request.use((config) => {
  const isPublicPath = PUBLIC_PATHS.some((path) =>
    config.url?.startsWith(path),
  );
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token && !isPublicPath) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 백엔드 응답이 { success, statusCode, message, data } 형태로 감싸져 있어서,
// 실제 payload(data)만 꺼내 response.data 자리에 넣어준다.
// 이후 모든 api 함수는 res.data가 곧 payload가 된다.
apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // TODO: 토큰 만료 처리 (재발급 or 로그아웃)
    }
    return Promise.reject(error);
  },
);
