import Image from "next/image";
import Pricing01 from "@public/images/pricing-01.png";
import Pricing02 from "@public/images/pricing-02.png";
import Pricing03 from "@public/images/pricing-03.png";
import Pricing04 from "@public/images/pricing-04.png";

export default function Section07() {
  return (
    <section>
      <div className="relative max-w-7xl mx-auto">
        {/* Bg */}
        <div
          className="absolute inset-0 rounded-tr-[100px] mb-24 md:mb-0 border-2 border-slate-100 pointer-events-none -z-10"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 rounded-tr-[100px] mb-24 md:mb-0 bg-gradient-to-t from-white pointer-events-none -z-10"
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-12 md:py-20">
            {/* Section content */}
            <div className="relative max-w-xl mx-auto md:max-w-none text-center md:text-left">
              {/* Section header */}
              <div className="md:max-w-3xl mb-12 md:mb-20" data-aos="fade-up">
                <h2 className="h2 mb-4">
                  Get the only custom super card you'll ever need
                </h2>
                <p className="text-lg text-slate-500 mb-8">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>

              {/* Pricing tables */}
              <div
                className="max-w-sm md:max-w-2xl xl:max-w-none mx-auto grid gap-8 md:grid-cols-2 xl:grid-cols-4 xl:gap-6 items-start"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                {/* Pricing table 1 */}
                <div className="relative flex flex-col h-full rounded-br-[100px] py-5 px-6">
                  <div className="mb-4">
                    <div className="text-lg font-bold text-center mb-3">
                      Starter
                    </div>
                    <Image
                      className="w-full rounded-lg"
                      src={Pricing01}
                      width={210}
                      height={124}
                      alt="Starter"
                    />
                  </div>
                  <div className="mb-5">
                    <div className="text-2xl text-slate-800 font-bold text-center mb-4">
                      $0/m
                    </div>
                    <a
                      className="btn-sm w-full inline-flex items-center text-blue-50 bg-blue-500 hover:bg-blue-600 shadow-sm"
                      href="#0"
                    >
                      Get Starter
                    </a>
                  </div>
                  <div className="text-slate-800 font-medium mb-4">
                    Features include
                  </div>
                  <ul className="text-slate-500 text-left space-y-2">
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Contactless payments</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Mobile payments</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Extra card (optional)</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Free payments worldwide</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Free domestic ATM withdrawals</span>
                    </li>
                  </ul>
                </div>

                {/* Pricing table 2 */}
                <div className="relative flex flex-col h-full bg-gradient-to-b from-blue-100 to-blue-50 rounded-br-[100px] py-5 px-6">
                  <div className="absolute top-0 right-0 -translate-y-1/2 mr-6 inline-flex text-sm text-white bg-teal-500 font-[550] rounded-full px-3 py-px">
                    Popular
                  </div>
                  <div className="mb-4">
                    <div className="text-lg font-bold text-center mb-3">
                      Smart
                    </div>
                    <Image
                      className="w-full rounded-lg"
                      src={Pricing02}
                      width={210}
                      height={124}
                      alt="Smart"
                    />
                  </div>
                  <div className="mb-5">
                    <div className="text-2xl text-slate-800 font-bold text-center mb-4">
                      $12/m
                    </div>
                    <a
                      className="btn-sm w-full inline-flex items-center text-slate-100 bg-slate-800 hover:bg-slate-900 shadow-sm"
                      href="#0"
                    >
                      Get Smart
                    </a>
                  </div>
                  <div className="text-slate-800 font-medium mb-4">
                    Everything in Starter, plus
                  </div>
                  <ul className="text-slate-500 text-left space-y-2">
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Cashback</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Travel insurance</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>3 Extra cards (optional)</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Flight insurance</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Two-factor authentication</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Chatbot and in-app support</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Discounted domestic transfers</span>
                    </li>
                  </ul>
                </div>

                {/* Pricing table 3 */}
                <div className="relative flex flex-col h-full rounded-br-[100px] py-5 px-6">
                  <div className="mb-4">
                    <div className="text-lg font-bold text-center mb-3">
                      You
                    </div>
                    <Image
                      className="w-full rounded-lg"
                      src={Pricing03}
                      width={210}
                      height={124}
                      alt="You"
                    />
                  </div>
                  <div className="mb-5">
                    <div className="text-2xl text-slate-800 font-bold text-center mb-4">
                      $24/m
                    </div>
                    <a
                      className="btn-sm w-full inline-flex items-center text-blue-50 bg-blue-500 hover:bg-blue-600 shadow-sm"
                      href="#0"
                    >
                      Get You
                    </a>
                  </div>
                  <div className="text-slate-800 font-medium mb-4">
                    Everything in Starter, plus
                  </div>
                  <ul className="text-slate-500 text-left space-y-2">
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Split and settle bills</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Money management</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>5 Extra cards (optional)</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Finance tracking</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>
                        Free and international domestic ATM withdrawals
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Pricing table 4 */}
                <div className="relative flex flex-col h-full rounded-br-[100px] py-5 px-6">
                  <div className="mb-4">
                    <div className="text-lg font-bold text-center mb-3">
                      Black
                    </div>
                    <Image
                      className="w-full rounded-lg"
                      src={Pricing04}
                      width={210}
                      height={124}
                      alt="Black"
                    />
                  </div>
                  <div className="mb-5">
                    <div className="text-2xl text-slate-800 font-bold text-center mb-4">
                      $49/m
                    </div>
                    <a
                      className="btn-sm w-full inline-flex items-center text-blue-50 bg-blue-500 hover:bg-blue-600 shadow-sm"
                      href="#0"
                    >
                      Get Black
                    </a>
                  </div>
                  <div className="text-slate-800 font-medium mb-4">
                    Everything in You, plus
                  </div>
                  <ul className="text-slate-500 text-left space-y-2">
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Manage subscriptions</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Savings vaults</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Commission-free stock trade</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Crypto and commodities</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-3 h-3 fill-current text-teal-500 mr-3 mt-1.5 shrink-0"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                      <span>Free foreign exchange</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
