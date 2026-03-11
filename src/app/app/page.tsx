/**
 * Mock Bears mobile app — a standalone page that looks and feels like a Bears app.
 * This is a demo surface to show that the same Contentful content renders on mobile.
 * There is no real data fetch here; content is passed via the Banner block on the homepage.
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
        <div className="absolute top-0 left-1/2 z-20 h-7 w-28 -translate-x-1/2 rounded-b-2xl bg-[#1a1a1a]" />

        {/* Status bar */}
        <div
          className="flex items-center justify-between px-6 pt-10 pb-2 text-xs text-white"
          style={{ backgroundColor: '#0B1F41' }}
        >
          <span className="font-semibold">9:41</span>
          <div className="flex gap-1">
            <span>●●●</span>
            <span>WiFi</span>
            <span>🔋</span>
          </div>
        </div>

        {/* App header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: '#0B1F41' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-black text-white"
              style={{ backgroundColor: '#C83803' }}
            >
              C
            </div>
            <div>
              <p className="text-xs text-white/60">Official App</p>
              <p className="text-sm font-bold text-white">Chicago Bears</p>
            </div>
          </div>
          <button className="rounded-full bg-white/10 p-2 text-white">
            🔔
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="overflow-y-auto"
          style={{ height: 'calc(100% - 160px)' }}
        >
          {/* Gameday banner — navy/orange block */}
          <div
            className="relative overflow-hidden px-4 py-6"
            style={{
              background: 'linear-gradient(135deg, #0B1F41 60%, #1a3a6b)',
            }}
          >
            <span
              className="mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest text-white uppercase"
              style={{ backgroundColor: '#C83803' }}
            >
              Home · Wk 14
            </span>
            <p
              className="mb-1 text-xs font-semibold tracking-widest uppercase"
              style={{ color: '#C83803' }}
            >
              vs Detroit Lions
            </p>
            <h2 className="mb-2 text-2xl font-extrabold text-white">
              Bear Down,
              <br />
              Chicago Bears
            </h2>
            <p className="mb-4 text-sm text-white/70">
              Sun, Dec 10 · 1:00 PM CT · Soldier Field
            </p>
            <a
              href="#"
              className="inline-block rounded-md px-4 py-2 text-xs font-bold tracking-wide text-white uppercase"
              style={{ backgroundColor: '#C83803' }}
            >
              Get Tickets
            </a>
            <div
              className="mt-4 h-0.5 w-full rounded"
              style={{ backgroundColor: '#C83803', opacity: 0.4 }}
            />
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-4 gap-1 bg-white px-2 py-3">
            {[
              { icon: '🎟', label: 'Tickets' },
              { icon: '📺', label: 'Watch' },
              { icon: '👥', label: 'Roster' },
              { icon: '🏟', label: 'Stadium' },
            ].map(({ icon, label }) => (
              <button
                key={label}
                className="flex flex-col items-center gap-1 rounded-lg p-2"
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-[10px] text-gray-600">{label}</span>
              </button>
            ))}
          </div>

          {/* News feed */}
          <div className="px-4 py-3">
            <h3 className="mb-3 text-sm font-bold text-gray-800">
              Latest News
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Bears Injury Report — Week 14', time: '2h ago' },
                {
                  title:
                    'Caleb Williams Named NFC Offensive Player of the Week',
                  time: '5h ago',
                },
                {
                  title: 'Coach Flus Weekly Press Conference Recap',
                  time: '1d ago',
                },
              ].map(({ title, time }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-lg bg-white p-3 shadow-sm"
                >
                  <div
                    className="h-14 w-14 flex-shrink-0 rounded-md"
                    style={{ backgroundColor: '#0B1F41', opacity: 0.15 }}
                  />
                  <div className="flex-1">
                    <p className="text-xs leading-snug font-semibold text-gray-800">
                      {title}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-400">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom tab bar */}
        <div className="absolute right-0 bottom-0 left-0 flex justify-around border-t border-gray-200 bg-white py-2">
          {[
            { icon: '🏠', label: 'Home' },
            { icon: '📅', label: 'Schedule' },
            { icon: '📰', label: 'News' },
            { icon: '🛒', label: 'Shop' },
            { icon: '👤', label: 'Profile' },
          ].map(({ icon, label }, i) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-xl">{icon}</span>
              <span
                className="text-[9px]"
                style={{ color: i === 0 ? '#C83803' : '#9ca3af' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="absolute bottom-4 text-xs text-gray-400">
        Mock app · Powered by Contentful
      </p>
    </div>
  );
}
