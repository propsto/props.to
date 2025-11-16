import { cn } from "@propsto/ui/lib/utils";

export function FAQs(): React.ReactNode {
  const faqs = [
    {
      title: "Can I use props.to for free?",
      text: "Yes! props.to is open source and always free to use, whether you’re collecting feedback for yourself or your team. Other features are optional and usually paid.",
    },
    {
      title: "Can I self-host props.to?",
      text: "Definitely! Props.to is fully self-hostable, giving you complete control over your data and deployment. Everyone will still have to connect to a personal account in props.to to retain their feedback.",
    },
    {
      title: "Can I use props.to in both public and private projects?",
      text: "Of course! Props.to works great for open source, internal tools, or any project where feedback matters, which is almost everywhere if not everywhere!",
    },
    {
      title:
        "Can I link feedback from my self-hosted instance to my personal props.to account?",
      text: "That's the whole point! You can link feedback from your self-hosted instance to your personal account, so you keep your received feedback in a single place, from wherever it came.",
    },
    {
      title: "How do I manage feedback across multiple projects?",
      text: "Props.to is designed to help you organize feedback across teams and projects with ease. You can create different feedback prompts for each project.",
    },
    {
      title: "Do you offer priority support or hosting services?",
      text: "Yes we do! While the core project is free, we offer optional premium services for teams that need enterprise support.",
    },
  ];
  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-8 sm:pb-24 sm:pt-10 lg:px-8">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <p className="text-center text-base [line-height:1.75rem] font-semibold text-zinc-600">
            You&apos;ve got questions.
          </p>
          <h2 className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
            We&apos;ve got answers.
          </h2>
        </div>
        <div className="mt-8 lg:mt-16">
          <dl className="sm:grid sm:grid-cols-2 lg:grid-cols-3 rounded-lg overflow-visible gap-4 space-y-4 lg:space-y-0">
            {faqs.map((faq, index) => {
              const total = faqs.length;
              const cols = 3; // lg:grid-cols-3
              const isFirstRow = index < cols;
              const isLastRow = index >= total - (total % cols || cols);
              const isFirstCol = index % cols === 0;
              const isLastCol = index % cols === cols - 1;

              const cornerClasses = cn({
                "rounded-t-[2rem] lg:rounded-t-none lg:rounded-tl-[2rem]":
                  isFirstRow && isFirstCol,
                "lg:rounded-tr-[2rem]": isFirstRow && isLastCol,
                "lg:rounded-bl-[2rem]": isLastRow && isFirstCol,
                "rounded-b-[2rem] lg:rounded-b-none lg:rounded-br-[2rem]":
                  isLastRow && isLastCol,
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
