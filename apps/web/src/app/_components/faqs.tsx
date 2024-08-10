import { Accordion } from "@components/accordion";

export function FAQs(): React.ReactNode {
  const faqs = [
    {
      title: "Can I use the product for free?",
      text: "Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.",
      active: false,
    },
    {
      title: "What payment methods can I use?",
      text: "Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.",
      active: false,
    },
    {
      title: "Can I change from monthly to yearly billing?",
      text: "Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.",
      active: false,
    },
    {
      title:
        "Can I use the tool for personal, client, and commercial projects?",
      text: "Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.",
      active: true,
    },
    {
      title: "How can I ask other questions about pricing?",
      text: "Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.",
      active: false,
    },
    {
      title: "Do you offer discount for students and no-profit companies?",
      text: "Absolutely! Grey allows you to create as many commercial graphics/images as you like, for yourself or your clients.",
      active: false,
    },
  ];
  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <Accordion
            key={faq.title}
            title={faq.title}
            id={`faqs-${index.toString()}`}
            active={faq.active}
          >
            {faq.text}
          </Accordion>
        ))}
      </div>
    </div>
  );
}
