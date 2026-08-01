import Image from 'next/image';
import Link from 'next/link';

export function LandingHeader() {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* <Image src={} /> */}
          <span className="h-6 w-6 rounded bg-black" />
          <span className="text-xl font-bold">K-test</span>
        </Link>

        <nav className="flex items-center gap-4">
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium text-gray-400"
          >
            소개
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M6 9l6 6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <Link
            href="/login"
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-50"
          >
            로그인하기
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            회원가입
          </Link>
        </nav>
      </div>
    </header>
  );
}
