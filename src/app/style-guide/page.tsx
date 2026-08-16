import { cn } from '@/lib/utils/cn';

const colors = [
  { name: 'primary', hex: '#1b1b1b', className: 'bg-primary' },
  { name: 'white', hex: '#ffffff', className: 'bg-white' },
  { name: 'page-bg', hex: '#f0f1f1', className: 'bg-page-bg' },
  { name: 'neutral-20', hex: '#f1f1f1', className: 'bg-neutral-20' },
  { name: 'neutral-30', hex: '#dee0e1', className: 'bg-neutral-30' },
  { name: 'neutral-90', hex: '#272929', className: 'bg-neutral-90' },
  { name: 'icon-30', hex: '#909090', className: 'bg-icon-30' },
  { name: 'icon-40', hex: '#7d7d7d', className: 'bg-icon-40' },
  { name: 'icon-50', hex: '#666666', className: 'bg-icon-50' },
  { name: 'icon-70', hex: '#545454', className: 'bg-icon-70' },
  { name: 'icon-80', hex: '#333333', className: 'bg-icon-80' },
  { name: 'icon-90', hex: '#121212', className: 'bg-icon-90' },
  { name: 'success', hex: '#3adb21', className: 'bg-success' },
];

const typography = [
  { name: 'text-body-sm', spec: '14 / 100 / 400', className: 'text-body-sm' },
  { name: 'text-body-md', spec: '16 / 132 / 400', className: 'text-body-md' },
  { name: 'text-title-sm', spec: '18 / 132 / 700', className: 'text-title-sm' },
  { name: 'text-title-md', spec: '24 / 120 / 700', className: 'text-title-md' },
  { name: 'text-title-lg', spec: '32 / 120 / 700', className: 'text-title-lg' },
  { name: 'text-badge-md', spec: '18 / 100 / 700', className: 'text-badge-md' },
  {
    name: 'text-button-md',
    spec: '18 / 100 / 700',
    className: 'text-button-md',
  },
  {
    name: 'text-button-lg',
    spec: '24 / 100 / 700',
    className: 'text-button-lg',
  },
];

export default function StyleGuidePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-title-lg text-primary">globals.css 스타일 가이드</h1>
      <p className="text-body-md mt-2 text-icon-50">
        폰트(Pretendard)와 color/typography 토큰이 실제로 적용되는지 확인하는
        테스트 페이지입니다.
      </p>

      <section className="mt-12">
        <h2 className="text-title-md text-primary">폰트 확인</h2>
        <div className="mt-4 space-y-2 rounded-lg border border-neutral-30 bg-white p-6">
          <p className="text-title-lg">가나다라마바사 ABCDEFG 0123456789</p>
          <p className="text-body-md">가나다라 ABCDEFG 0123456789</p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-title-md text-primary">Colors</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {colors.map((color) => (
            <div
              key={color.name}
              className="overflow-hidden rounded-lg border border-neutral-30 bg-white"
            >
              <div className={cn('h-16 w-full', color.className)} />
              <div className="p-3">
                <p className="text-body-sm font-semibold text-primary">
                  {color.name}
                </p>
                <p className="text-body-sm text-icon-50">{color.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 pb-16">
        <h2 className="text-title-md text-primary">Typography</h2>
        <div className="mt-4 divide-y divide-neutral-30 rounded-lg border border-neutral-30 bg-white">
          {typography.map((type) => (
            <div
              key={type.name}
              className="flex items-baseline justify-between gap-6 p-4"
            >
              <p className={type.className}>{type.name} 텍스트 샘플</p>
              <span className="text-body-sm shrink-0 text-icon-50">
                {type.spec} · {type.className}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
