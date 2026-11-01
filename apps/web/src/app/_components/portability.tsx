export default function Portability(): React.ReactElement {
  return (
    <section className="relative bg-primary text-primary-foreground">
      <div className="py-16 sm:py-24">
        <div className="mx-auto grid max-w-2xl items-center gap-12 px-4 sm:px-6 lg:max-w-6xl lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-base [line-height:1.75rem] font-semibold text-zinc-300 uppercase">
              Yours to keep
            </p>
            <h2 className="mt-2 mb-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Change jobs. Keep your feedback.
            </h2>
            <p className="text-lg leading-relaxed text-zinc-300 md:text-xl">
              Feedback about you belongs to you. When you leave a company, your
              personal record comes with you, and the company keeps only what
              was shared with it.
            </p>
          </div>
          <ul className="space-y-3 text-base">
            <li className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3">
              <span>Globex · 2023 to 2025</span>
              <span className="text-zinc-300">Kept in your account</span>
            </li>
            <li className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3">
              <span>Acme · 2025 to now</span>
              <span className="text-zinc-300">Kept in your account</span>
            </li>
            <li
              style={{ backgroundColor: "var(--bubble-color-0-hex-full)" }}
              className="flex items-center justify-between rounded-lg px-4 py-3 font-semibold text-primary"
            >
              <span>Your personal links</span>
              <span>Always yours</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
