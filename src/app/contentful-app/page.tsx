/**
 * Contentful Apps — dev index
 * Not registered in any App Definition. Local nav only.
 */
export default function ContentfulAppsIndex() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--background)] p-8 text-[var(--foreground)]">
      <h1 className="text-xl font-semibold">Contentful Apps</h1>
      <ul className="flex flex-col gap-2 text-sm">
        <li>
          <a href="/contentful-app/section-style-editor" className="underline">
            Section Style Editor
          </a>{' '}
          — entry-field, entry-editor
        </li>
        <li>
          <a href="/contentful-app/integration-simulator" className="underline">
            Integration Simulator
          </a>{' '}
          — app-config, entry-field, dialog
        </li>
      </ul>
    </div>
  );
}
