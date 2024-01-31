import Link from "next/link";
import Image from "next/image";
import HeroIllustration from "@/public/images/hero-illustration.png";
import HeroImage from "@/public/images/hero-image.png";
import Stats from "@/components/stats";

export default function Hero() {
  return (
    <section className="animated-background">
      <div className="pt-32 pb-12 md:pt-40 md:pb-20">
        {/* Section content */}
        <div className="px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto">
            <div className="text-center pb-12 md:pb-16">
              <h1 className="font-inter-tight text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-500 via-zinc-900 to-zinc-900 pb-4">
                Open source <br />
                recognition software
              </h1>
              <p className="text-xl text-zinc-800 mb-8">
                Unleashing Human Potential
              </p>
              <div className="max-w-xs mx-auto sm:max-w-none sm:inline-flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div>
                  <a
                    className="btn text-zinc-600 bg-white hover:text-zinc-900 w-full shadow"
                    href="#early-access"
                  >
                    Request early access
                  </a>
                </div>
                <div>
                  <Link
                    className="btn text-zinc-100 bg-zinc-900 hover:bg-zinc-800 w-full shadow"
                    href="https://github.com/propsto/props.to"
                  >
                    Contribute
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
