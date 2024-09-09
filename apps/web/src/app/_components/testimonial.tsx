import Image from "next/image";

interface TestimonialProps extends React.PropsWithChildren {
  testimonial: {
    image: string;
    name: string;
    user: string;
    link: string;
    content: string;
  };
}

export function Testimonial({
  testimonial,
  children,
}: TestimonialProps): JSX.Element {
  return (
    <div className="rounded h-full w-[22rem] border border-transparent [background:linear-gradient(#323237,#323237)_padding-box,linear-gradient(120deg,theme(colors.zinc.700),theme(colors.zinc.700),theme(colors.zinc.700))_border-box] p-5">
      <div className="flex items-center mb-4">
        <Image
          className="shrink-0 rounded-full mr-3"
          src={testimonial.image}
          width={44}
          height={44}
          alt={testimonial.name}
        />
        <div>
          <div className="font-inter-tight font-bold text-zinc-200">
            {testimonial.name}
          </div>
          <div>
            <a
              className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition"
              href={testimonial.link}
            >
              {testimonial.user}
            </a>
          </div>
        </div>
      </div>
      <div className="text-zinc-500">&quot;{children}&quot;</div>
    </div>
  );
}
