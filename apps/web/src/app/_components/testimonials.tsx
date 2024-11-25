"use client";
import { Testimonial } from "@components/testimonial";

export function Testimonials(): JSX.Element {
  const testimonials01 = [
    {
      image: "/images/testimonial-01.jpg",
      name: "Lina James",
      user: "@linaj87",
      link: "#0",
      content:
        "Extremely thoughtful approaches to business. I highly recommend this product to anyone wanting to jump into something new.",
    },
    {
      image: "/images/testimonial-02.jpg",
      name: "Lisa Jones",
      user: "@ljones",
      link: "#0",
      content:
        "Extremely thoughtful approaches to business. I highly recommend this product to anyone wanting to jump into something new.",
    },
    {
      image: "/images/testimonial-03.jpg",
      name: "Pete Moore",
      user: "@petemoore1",
      link: "#0",
      content:
        "Extremely thoughtful approaches to business. I highly recommend this product to anyone wanting to jump into something new.",
    },
    {
      image: "/images/testimonial-04.jpg",
      name: "Mary Kahl",
      user: "@marykahl",
      link: "#0",
      content:
        "Extremely thoughtful approaches to business. I highly recommend this product to anyone wanting to jump into something new.",
    },
  ];

  const testimonials02 = [
    {
      image: "/images/testimonial-05.jpg",
      name: "Katy Dragán",
      user: "@katyd",
      link: "#0",
      content:
        "Extremely thoughtful approaches to business. I highly recommend this product to anyone wanting to jump into something new.",
    },
    {
      image: "/images/testimonial-06.jpg",
      name: "Karl Ahmed",
      user: "@karl87",
      link: "#0",
      content:
        "Extremely thoughtful approaches to business. I highly recommend this product to anyone wanting to jump into something new.",
    },
    {
      image: "/images/testimonial-07.jpg",
      name: "Carlotta Grech",
      user: "@carlagrech",
      link: "#0",
      content:
        "Extremely thoughtful approaches to business. I highly recommend this product to anyone wanting to jump into something new.",
    },
    {
      image: "/images/testimonial-08.jpg",
      name: "Alejandra Gok",
      user: "@alejandraIT",
      link: "#0",
      content:
        "Extremely thoughtful approaches to business. I highly recommend this product to anyone wanting to jump into something new.",
    },
  ];

  return (
    <section className="bg-zinc-800">
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="font-cal text-3xl md:text-4xl font-bold text-zinc-200">
              Loved by thousands of creatives from around the world
            </h2>
          </div>
        </div>
        <div className="max-w-[94rem] mx-auto space-y-6">
          {/* Row #1 */}
          <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_28%,_black_calc(100%-28%),transparent_100%)] group">
            <div className="flex items-start justify-center md:justify-start [&>div]:mx-3 animate-infinite-scroll group-hover:[animation-play-state:paused]">
              {/* Items */}
              {testimonials01.map(testimonial => (
                <Testimonial key={testimonial.name} testimonial={testimonial}>
                  {testimonial.content}
                </Testimonial>
              ))}
            </div>
            {/* Duplicated element for infinite scroll */}
            <div
              className="flex items-start justify-center md:justify-start [&>div]:mx-3 animate-infinite-scroll group-hover:[animation-play-state:paused]"
              aria-hidden="true"
            >
              {/* Items */}
              {testimonials01.map(testimonial => (
                <Testimonial key={testimonial.name} testimonial={testimonial}>
                  {testimonial.content}
                </Testimonial>
              ))}
            </div>
          </div>
          {/* Row #2 */}
          <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_28%,_black_calc(100%-28%),transparent_100%)] group">
            <div className="flex items-start justify-center md:justify-start [&>div]:mx-3 animate-infinite-scroll-inverse group-hover:[animation-play-state:paused] [animation-delay:-7.5s]">
              {/* Items */}
              {testimonials02.map(testimonial => (
                <Testimonial key={testimonial.name} testimonial={testimonial}>
                  {testimonial.content}
                </Testimonial>
              ))}
            </div>
            {/* Duplicated element for infinite scroll */}
            <div
              className="flex items-start justify-center md:justify-start [&>div]:mx-3 animate-infinite-scroll-inverse group-hover:[animation-play-state:paused] [animation-delay:-7.5s]"
              aria-hidden="true"
            >
              {/* Items */}
              {testimonials02.map(testimonial => (
                <Testimonial key={testimonial.name} testimonial={testimonial}>
                  {testimonial.content}
                </Testimonial>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
