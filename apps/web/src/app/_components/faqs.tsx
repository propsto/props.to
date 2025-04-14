import { cn } from "@propsto/ui/lib/utils";

export function FAQs(): React.ReactNode {
  const faqs = [
    {
      title: "Can I use the product for free?",
      text: "Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.",
    },
    {
      title: "What payment methods can I use?",
      text: "Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.",
    },
    {
      title: "Can I change from monthly to yearly billing?",
      text: "Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.",
    },
    {
      title:
        "Can I use the tool for personal, client, and commercial projects?",
      text: "Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.",
    },
    {
      title: "How can I ask other questions about pricing?",
      text: "Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.",
    },
    {
      title: "Do you offer discount for students and no-profit companies?",
      text: "Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.",
    },
  ];
  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 pb-16 sm:pb-24 sm:pt-10 lg:px-8">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <p className="text-center text-base [line-height:1.75rem] font-semibold text-zinc-600">
            You&apos;ve got questions.
          </p>
          <h2 className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
            We&apos;ve got answers.
          </h2>
        </div>
        <div className="mt-16">
          <dl className="sm:grid sm:grid-cols-2 sm:space-y-0 lg:grid-cols-3 rounded-lg gap-4 overflow-visible">
            {faqs.map((faq, index) => {
              const total = faqs.length;
              const cols = 3; // lg:grid-cols-3
              const isFirstRow = index < cols;
              const isLastRow = index >= total - (total % cols || cols);
              const isFirstCol = index % cols === 0;
              const isLastCol = index % cols === cols - 1;

              const cornerClasses = cn({
                "rounded-tl-[2rem]": isFirstRow && isFirstCol,
                "rounded-tr-[2rem]": isFirstRow && isLastCol,
                "rounded-bl-[2rem]": isLastRow && isFirstCol,
                "rounded-br-[2rem]": isLastRow && isLastCol,
              });

              return (
                <div
                  key={faq.title}
                  className={cn(
                    "p-5 border border-black/5 shadow-md",
                    cornerClasses,
                    `bg-triangle-${(index % 6).toString()}`,
                  )}
                >
                  <dt className="text-base/7 font-semibold text-gray-900">
                    {faq.title}
                  </dt>
                  <dd className="mt-2 text-base/7 text-gray-600">{faq.text}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </div>
  );
}
