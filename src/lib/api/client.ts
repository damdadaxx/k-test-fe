import axios from 'axios';

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/lib/auth/tokenStorage';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15000,
});

/** 백엔드 에러 응답의 message를 꺼낸다. 못 꺼내면 fallback을 돌려준다. */
export function getErrorMessage(error: unknown, fallback = '') {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') return message;
  }
  return fallback;
}

/** 인증 없이 호출 가능한 API 경로. 이 목록에 있는 요청엔 Authorization 헤더를 안 붙임. */
const PUBLIC_PATHS = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/check-email',
  '/auth/refresh',
  '/auth/email/send-code',
  '/auth/email/verify',
];

apiClient.interceptors.request.use((config) => {
  const isPublicPath = PUBLIC_PATHS.some((path) =>
    config.url?.startsWith(path),
  );
  const token = getAccessToken();
  if (token && !isPublicPath) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RefreshedTokens = {
  accessToken: string;
  refreshToken: string;
  role: string;
};

// 동시에 여러 요청이 401을 맞아도 /auth/refresh는 한 번만 나가도록 진행 중인
// 재발급 요청을 공유한다.
let refreshPromise: Promise<RefreshedTokens> | null = null;

function refreshAccessToken(refreshToken: string) {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
        refreshToken,
      })
      .then((res) => res.data.data as RefreshedTokens)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

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
  async (error) => {
    const originalRequest = error.config;

    const isRefreshCall = originalRequest?.url?.startsWith('/auth/refresh');
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshCall
    ) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        return Promise.reject(error);
      }

      try {
        const refreshed = await refreshAccessToken(refreshToken);
        setTokens(refreshed);
        originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        // refreshToken도 만료/무효 -> 로그아웃 상태로 정리, RouteGuard가 리다이렉트
        clearTokens();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
