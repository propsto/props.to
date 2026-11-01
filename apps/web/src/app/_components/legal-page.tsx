// Plain reading layout for the privacy policy and terms.
export function LegalPage({
  title,
  updated,
  children,
}: Readonly<
  React.PropsWithChildren<{ title: string; updated: string }>
>): React.ReactElement {
  return (
    <section className="bg-white">
      <article className="mx-auto max-w-3xl px-4 pt-32 pb-20 text-lg leading-relaxed text-gray-700 sm:px-6 md:pt-44 [&_a]:font-medium [&_a]:text-gray-950 [&_a]:underline [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-gray-950 sm:[&_h2]:text-3xl [&_li]:mt-2 [&_p]:mt-4 [&_strong]:text-gray-950 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
        <h1 className="text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
          {title}
        </h1>
        <p className="text-base text-muted-foreground">
          Last updated {updated}
        </p>
        {children}
      </article>
    </section>
  );
}
