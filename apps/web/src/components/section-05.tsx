import Image from "next/image";
import LogosIllustration from "@public/images/logos-illustration.svg";
import Logos from "@public/images/logos.png";

export default function Section05() {
  return (
    <section>
      <div className="relative max-w-7xl mx-auto">
        {/* Bg */}
        <div
          className="absolute inset-0 rounded-tr-[100px] bg-gradient-to-tr from-blue-600 to-blue-500 pointer-events-none -z-10"
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-12 md:py-20">
            {/* Section content */}
            <div className="relative max-w-xl mx-auto md:max-w-none text-center md:text-left">
              {/* Section header */}
              <div className="md:max-w-3xl mb-12 md:mb-20" data-aos="fade-up">
                <h2 className="h2 text-white mb-4">
                  Get started in minutes and connect all your accounts in one
                  place
                </h2>
                <p className="text-lg text-blue-200 mb-8">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>

              {/* Image */}
              <div
                className="flex justify-center mb-6"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <div className="relative">
                  <Image
                    className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none -z-10 max-w-none mix-blend-lighten"
                    src={LogosIllustration}
                    alt="Logos illustration"
                    aria-hidden="true"
                  />
                  <Image src={Logos} width={720} height={283} alt="Logos" />
                </div>
              </div>

              {/* Items */}
              <div
                className="max-w-sm mx-auto grid gap-12 md:grid-cols-3 md:-mx-9 md:gap-0 items-start md:max-w-none text-left"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                {/* 1st item */}
                <div className="relative md:px-9 after:hidden md:after:block after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-px after:h-16 after:bg-blue-400 last:after:hidden">
                  <div className="mb-3">
                    <div className="flex items-center justify-center font-bold text-teal-600 bg-teal-200 h-11 w-11 rounded-full">
                      1
                    </div>
                  </div>
                  <h4 className="text-white text-xl font-bold mb-1">
                    Download the app
                  </h4>
                  <p className="text-blue-200">
                    Create cards that work exactly as you configured them. Make
                    real-time decisions on charges and spendings.
                  </p>
                </div>

                {/* 2nd item */}
                <div className="relative md:px-9 after:hidden md:after:block after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-px after:h-16 after:bg-blue-400 last:after:hidden">
                  <div className="mb-3">
                    <div className="flex items-center justify-center font-bold text-teal-600 bg-teal-200 h-11 w-11 rounded-full">
                      2
                    </div>
                  </div>
                  <h4 className="text-white text-xl font-bold mb-1">
                    Request your card
                  </h4>
                  <p className="text-blue-200">
                    Create cards that work exactly as you configured them. Make
                    real-time decisions on charges and spendings.
                  </p>
                </div>

                {/* 3rd item */}
                <div className="relative md:px-9 after:hidden md:after:block after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-px after:h-16 after:bg-blue-400 last:after:hidden">
                  <div className="mb-3">
                    <div className="flex items-center justify-center font-bold text-teal-600 bg-teal-200 h-11 w-11 rounded-full">
                      3
                    </div>
                  </div>
                  <h4 className="text-white text-xl font-bold mb-1">
                    Connect all your account
                  </h4>
                  <p className="text-blue-200">
                    Create cards that work exactly as you configured them. Make
                    real-time decisions on charges and spendings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
