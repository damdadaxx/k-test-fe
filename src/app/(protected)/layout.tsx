import { RouteGuard } from '@/components/auth/RouteGuard';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: 로그인기능 추가 후 수정하기
  return <RouteGuard>{children}</RouteGuard>;
}
