/**
 * Generic mock mobile app — a standalone page that simulates a branded mobile app.
 * Used in multi-channel demos to show the same Contentful content rendering across surfaces.
 *
 * Styling is driven by CSS vars injected at render time via getSettings() / themeToStyle()
 * in layout.tsx. No brand-specific content is hardcoded here — all copy/colors come from
 * Contentful siteSettings.
 *
 * For a connected live-preview demo, use /preview/banner/[entryId] which shows
 * both this phone frame and the web banner side by side.
 */

export default function MockAppPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: '#f0f0f0' }}
    >
      <div
        className="relative overflow-hidden rounded-[2.5rem] shadow-2xl"
        style={{
          width: 375,
          height: 780,
          border: '12px solid #1a1a1a',
          backgroundColor: '#f5f5f7',
        }}
      >
        {/* Notch */}
        <div
          className="absolute top-0 left-1/2 z-10 -translate-x-1/2 rounded-b-2xl"
          style={{ width: 120, height: 30, backgroundColor: '#1a1a1a' }}
        />

        {/* Status bar */}
        <div
          className="flex items-center justify-between px-6 pt-10 pb-2 text-xs font-semibold text-white"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <span>9:41</span>
          <span>●●●</span>
        </div>

        {/* App header */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <div
            className="flex size-9 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: 'var(--accent, var(--primary))' }}
          >
            M
          </div>
          <div>
            <p className="text-sm font-bold text-white capitalize">Metafi</p>
            <p className="text-xs text-white/70">Official App</p>
          </div>
        </div>

        {/* Hero banner area */}
        <div
          className="flex h-44 flex-col items-center justify-center gap-2 text-white"
          style={{
            background:
              'linear-gradient(135deg, var(--primary) 60%, color-mix(in oklch, var(--primary), transparent 30%))',
          }}
        >
          <p className="text-2xl font-extrabold tracking-wide uppercase">
            Latest News
          </p>
          <p className="text-sm text-white/80">Powered by Contentful</p>
        </div>

        {/* Content cards */}
        <div className="space-y-3 overflow-y-auto p-4" style={{ height: 380 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-white p-4 shadow-sm">
              <div
                className="mb-2 h-2 w-16 rounded-full"
                style={{ backgroundColor: 'var(--accent, var(--primary))' }}
              />
              <div className="mb-1 h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-3/4 rounded bg-gray-100" />
            </div>
          ))}
        </div>

        {/* Bottom nav */}
        <div
          className="absolute bottom-0 flex w-full justify-around border-t border-white/10 px-6 py-3"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {['Home', 'News', 'Shop'].map((label) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="size-5 rounded-sm bg-white/40" />
              <span className="text-[10px] text-white/70">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Label */}
      <p className="absolute bottom-6 text-sm text-gray-400">
        Multi-channel demo · Metafi theme
      </p>
    </div>
  );
}
