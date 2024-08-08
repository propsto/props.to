"use client";

import { Accordion } from "@components/accordion";

export function PricingTabs(): JSX.Element {
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
    <section>
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="font-cal text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              There&apos;s a plan for everyone
            </h2>
            <p className="text-lg text-zinc-500">
              Start claiming your received feedback. Upgrade to get extra
              features and buy a license to get them in a self-hosted props.to.
            </p>
          </div>

          {/* Pricing tabs component */}
          <section className="text-gray-700 body-font overflow-hidden">
            <div className="container px-5 py-24 mx-auto flex flex-wrap">
              <div className="lg:w-1/4 mt-48 hidden lg:block">
                <div className="mt-px border-t border-gray-300 border-b border-l rounded-tl-lg rounded-bl-lg overflow-hidden">
                  <p className="bg-gray-100 text-gray-900 h-12 text-center px-4 flex items-center justify-start -mt-px">
                    Fingerstache disrupt
                  </p>
                  <p className="text-gray-900 h-12 text-center px-4 flex items-center justify-start">
                    Franzen hashtag
                  </p>
                  <p className="bg-gray-100 text-gray-900 h-12 text-center px-4 flex items-center justify-start">
                    Tilde art party
                  </p>
                  <p className="text-gray-900 h-12 text-center px-4 flex items-center justify-start">
                    Banh mi cornhole
                  </p>
                  <p className="bg-gray-100 text-gray-900 h-12 text-center px-4 flex items-center justify-start">
                    Waistcoat squid hexagon
                  </p>
                  <p className="text-gray-900 h-12 text-center px-4 flex items-center justify-start">
                    Pinterest occupy authentic
                  </p>
                  <p className="bg-gray-100 text-gray-900 h-12 text-center px-4 flex items-center justify-start">
                    Brooklyn helvetica
                  </p>
                  <p className="text-gray-900 h-12 text-center px-4 flex items-center justify-start">
                    Long Feature Two
                  </p>
                  <p className="bg-gray-100 text-gray-900 h-12 text-center px-4 flex items-center justify-start">
                    Feature One
                  </p>
                </div>
              </div>
              <div className="flex lg:w-3/4 w-full flex-wrap lg:border border-gray-300 rounded-lg">
                <div className="lg:w-1/3 lg:mt-px w-full mb-10 lg:mb-0 border-2 border-gray-300 lg:border-none rounded-lg lg:rounded-none">
                  <div className="px-2 text-center h-48 flex flex-col items-center justify-center">
                    <h3 className="tracking-widest">START</h3>
                    <h2 className="text-5xl text-gray-900 font-medium leading-none mb-4 mt-2">
                      Free
                    </h2>
                    <span className="text-sm text-gray-600">Next 3 months</span>
                  </div>
                  <p className="bg-gray-100 text-gray-600 h-12 text-center px-2 flex items-center -mt-px justify-center border-t border-gray-300">
                    Schlitz single-origin
                  </p>
                  <p className="text-gray-600 text-center h-12 flex items-center justify-center">
                    <span className="w-5 h-5 inline-flex items-center justify-center bg-gray-500 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                  </p>
                  <p className="bg-gray-100 text-gray-600 text-center h-12 flex items-center justify-center">
                    <span className="w-5 h-5 inline-flex items-center justify-center bg-gray-500 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                  </p>
                  <p className="h-12 text-gray-600 px-6 text-center leading-relaxed flex items-center justify-center">
                    Feature
                  </p>
                  <p className="bg-gray-100 text-gray-600 text-center h-12 flex items-center justify-center">
                    <span className="w-5 h-5 inline-flex items-center justify-center bg-gray-500 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                  </p>
                  <p className="text-gray-600 text-center h-12 flex items-center justify-center">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </p>
                  <p className="bg-gray-100 text-gray-600 text-center h-12 flex items-center justify-center">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </p>
                  <p className="text-gray-600 text-center h-12 flex items-center justify-center">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </p>
                  <p className="bg-gray-100 text-gray-600 text-center h-12 flex items-center justify-center">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </p>
                  <div className="border-t border-gray-300 p-6 text-center rounded-bl-lg">
                    <button className="flex items-center mt-auto text-white bg-indigo-500 border-0 py-2 px-4 w-full focus:outline-none hover:bg-indigo-600 rounded">
                      Button
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="w-4 h-4 ml-auto"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                      </svg>
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      Literally you probably haven&apos;t heard of them jean
                      shorts.
                    </p>
                  </div>
                </div>
                <div className="lg:w-1/3 lg:-mt-px w-full mb-10 lg:mb-0 border-2 rounded-lg border-indigo-500 relative">
                  <span className="bg-indigo-500 text-white px-3 py-1 tracking-widest text-xs absolute right-0 top-0 rounded-bl">
                    POPULAR
                  </span>
                  <div className="px-2 text-center h-48 flex flex-col items-center justify-center">
                    <h3 className="tracking-widest">PRO</h3>
                    <h2 className="text-5xl text-gray-900 font-medium flex items-center justify-center leading-none mb-4 mt-2">
                      $38
                      <span className="text-gray-600 text-base ml-1">/mo</span>
                    </h2>
                    <span className="text-sm text-gray-600">
                      Charging $456 per year
                    </span>
                  </div>
                  <p className="bg-gray-100 text-gray-600 h-12 text-center px-2 flex items-center -mt-px justify-center border-t border-gray-300">
                    Schlitz single-origin
                  </p>
                  <p className="text-gray-600 text-center h-12 flex items-center justify-center">
                    <span className="w-5 h-5 inline-flex items-center justify-center bg-gray-500 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                  </p>
                  <p className="bg-gray-100 text-gray-600 text-center h-12 flex items-center justify-center">
                    <span className="w-5 h-5 inline-flex items-center justify-center bg-gray-500 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                  </p>
                  <p className="h-12 text-gray-600 text-center leading-relaxed flex items-center justify-center">
                    Feature
                  </p>
                  <p className="bg-gray-100 text-gray-600 text-center h-12 flex items-center justify-center">
                    <span className="w-5 h-5 inline-flex items-center justify-center bg-gray-500 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                  </p>
                  <p className="text-gray-600 text-center h-12 flex items-center justify-center">
                    <span className="w-5 h-5 inline-flex items-center justify-center bg-gray-500 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                  </p>
                  <p className="bg-gray-100 text-gray-600 text-center h-12 flex items-center justify-center">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </p>
                  <p className="text-gray-600 text-center h-12 flex items-center justify-center">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </p>
                  <p className="bg-gray-100 text-gray-600 text-center h-12 flex items-center justify-center">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </p>
                  <div className="p-6 text-center border-t border-gray-300">
                    <button className="flex items-center mt-auto text-white bg-indigo-500 border-0 py-2 px-4 w-full focus:outline-none hover:bg-indigo-600 rounded">
                      Button
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="w-4 h-4 ml-auto"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                      </svg>
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      Literally you probably haven&apos;t heard of them jean
                      shorts.
                    </p>
                  </div>
                </div>
                <div className="lg:w-1/3 w-full lg:mt-px border-2 border-gray-300 lg:border-none rounded-lg lg:rounded-none">
                  <div className="px-2 text-center h-48 flex flex-col items-center justify-center">
                    <h3 className="tracking-widest">BUSINESS</h3>
                    <h2 className="text-5xl text-gray-900 font-medium flex items-center justify-center leading-none mb-4 mt-2">
                      $54
                      <span className="text-gray-600 text-base ml-1">/mo</span>
                    </h2>
                    <span className="text-sm text-gray-600">
                      Charging $648 per year
                    </span>
                  </div>
                  <p className="bg-gray-100 text-gray-600 h-12 text-center px-2 flex items-center -mt-px justify-center border-t border-gray-300">
                    Schlitz single-origin
                  </p>
                  <p className="text-gray-600 text-center h-12 flex items-center justify-center">
                    <span className="w-5 h-5 inline-flex items-center justify-center bg-gray-500 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                  </p>
                  <p className="bg-gray-100 text-gray-600 text-center h-12 flex items-center justify-center">
                    <span className="w-5 h-5 inline-flex items-center justify-center bg-gray-500 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                  </p>
                  <p className="h-12 text-gray-600 text-center leading-relaxed flex items-center justify-center">
                    Feature
                  </p>
                  <p className="bg-gray-100 text-gray-600 text-center h-12 flex items-center justify-center">
                    <span className="w-5 h-5 inline-flex items-center justify-center bg-gray-500 text-white rounded-full flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </span>
                  </p>
                  <p className="text-gray-600 text-center h-12 flex items-center justify-center">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </p>
                  <p className="bg-gray-100 text-gray-600 text-center h-12 flex items-center justify-center">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </p>
                  <p className="text-gray-600 text-center h-12 flex items-center justify-center">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </p>
                  <p className="bg-gray-100 text-gray-600 text-center h-12 flex items-center justify-center">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </p>
                  <div className="p-6 text-center border-t border-gray-300">
                    <button className="flex items-center mt-auto text-white bg-indigo-500 border-0 py-2 px-4 w-full focus:outline-none hover:bg-indigo-600 rounded">
                      Button
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="w-4 h-4 ml-auto"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                      </svg>
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      Literally you probably haven&apos;t heard of them jean
                      shorts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQs */}
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
        </div>
      </div>
    </section>
  );
}
