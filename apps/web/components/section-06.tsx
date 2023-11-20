"use client";

import { useEffect } from "react";
import Image from "next/image";
import Testimonial01 from "@/public/images/testimonial-01.jpg";
import TestimonialSign01 from "@/public/images/testimonial-sign-01.svg";
import Testimonial02 from "@/public/images/testimonial-02.jpg";
import TestimonialSign02 from "@/public/images/testimonial-sign-02.svg";

// Import Swiper
import Swiper, { Pagination, EffectFade } from "swiper";
import "swiper/swiper.min.css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
Swiper.use([Pagination, EffectFade]);

export default function Section06() {
  useEffect(() => {
    const testimonial = new Swiper(".testimonial-carousel", {
      slidesPerView: 1,
      watchSlidesProgress: true,
      effect: "fade",
      pagination: {
        el: ".testimonial-carousel-pagination",
        clickable: true,
      },
    });
  }, []);

  return (
    <section className="mt-12 md:mt-20" data-aos-id-6>
      <div className="relative max-w-7xl mx-auto">
        {/* Bg */}
        <div
          className="absolute inset-0 rounded-tl-[100px] mb-24 md:mb-0 bg-gradient-to-b from-slate-100 pointer-events-none -z-10"
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-12 md:py-20">
            {/* Section content */}
            <div className="relative max-w-xl mx-auto md:max-w-none text-center md:text-left flex flex-col md:flex-row items-center justify-end">
              {/* Content */}
              <div className="w-[512px] max-w-full shrink-0 md:order-1">
                {/* Copy */}
                <h2
                  className="h2 mb-4"
                  data-aos="fade-up"
                  data-aos-anchor="[data-aos-id-6]"
                  data-aos-delay="100"
                >
                  Compliance built card for businesses and professionals
                </h2>
                <p
                  className="text-lg text-slate-500 mb-6"
                  data-aos="fade-up"
                  data-aos-anchor="[data-aos-id-6]"
                  data-aos-delay="200"
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua
                  minim veniam, quis nostrud exercitation.
                </p>
                <ul
                  className="inline-flex flex-col text-slate-500 space-y-2.5"
                  data-aos="fade-up"
                  data-aos-anchor="[data-aos-id-6]"
                  data-aos-delay="300"
                >
                  <li className="flex items-center">
                    <svg
                      className="shrink-0 mr-3"
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="fill-blue-100"
                        cx="10"
                        cy="10"
                        r="10"
                      />
                      <path
                        className="fill-blue-500"
                        d="M15.335 7.933 14.87 7c-4.025 1.167-6.067 3.733-6.067 3.733l-1.867-1.4-.933.934L8.802 14c2.158-4.025 6.533-6.067 6.533-6.067Z"
                      />
                    </svg>
                    <span>Identity verifications</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="shrink-0 mr-3"
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="fill-blue-100"
                        cx="10"
                        cy="10"
                        r="10"
                      />
                      <path
                        className="fill-blue-500"
                        d="M15.335 7.933 14.87 7c-4.025 1.167-6.067 3.733-6.067 3.733l-1.867-1.4-.933.934L8.802 14c2.158-4.025 6.533-6.067 6.533-6.067Z"
                      />
                    </svg>
                    <span>Secure credit card data tokenization</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="shrink-0 mr-3"
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="fill-blue-100"
                        cx="10"
                        cy="10"
                        r="10"
                      />
                      <path
                        className="fill-blue-500"
                        d="M15.335 7.933 14.87 7c-4.025 1.167-6.067 3.733-6.067 3.733l-1.867-1.4-.933.934L8.802 14c2.158-4.025 6.533-6.067 6.533-6.067Z"
                      />
                    </svg>
                    <span>Online and mobile payments</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="shrink-0 mr-3"
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="fill-blue-100"
                        cx="10"
                        cy="10"
                        r="10"
                      />
                      <path
                        className="fill-blue-500"
                        d="M15.335 7.933 14.87 7c-4.025 1.167-6.067 3.733-6.067 3.733l-1.867-1.4-.933.934L8.802 14c2.158-4.025 6.533-6.067 6.533-6.067Z"
                      />
                    </svg>
                    <span>IGlobal regulations and compliance</span>
                  </li>
                </ul>
              </div>

              {/* Carousel */}
              <div
                className="w-full max-w-sm md:max-w-none md:mr-8 mt-12 md:mt-0"
                data-aos="fade-up"
                data-aos-anchor="[data-aos-id-6]"
              >
                <div className="relative max-w-sm mx-auto">
                  <div
                    className="absolute inset-0 mb-10 -mt-14 -mx-14 bg-slate-100 -z-10"
                    aria-hidden="true"
                  />

                  {/* Carousel built with Swiper.js [https://swiperjs.com/] */}
                  {/* * Custom styles in src/css/additional-styles/theme.scss */}
                  <div className="testimonial-carousel swiper-container max-w-sm mx-auto sm:max-w-none">
                    <div className="swiper-wrapper">
                      {/* Card #1 */}
                      <div className="swiper-slide flex flex-col h-auto shadow-2xl text-left">
                        <div className="relative after:absolute after:inset-0 after:bg-gradient-to-t after:from-slate-700">
                          <Image
                            src={Testimonial01}
                            className="md:max-w-none"
                            width={384}
                            height={180}
                            alt="Testiomonial 01"
                          />
                        </div>
                        <div className="grow flex flex-col relative bg-gradient-to-t from-slate-800 to-slate-700 p-6 pt-14">
                          <Image
                            className="absolute bottom-full translate-y-1/2"
                            src={TestimonialSign01}
                            alt="Testiomonial sign 01"
                          />
                          <p className="grow font-medium text-slate-200 mb-4">
                            “ This card is awesome. The app lets me link foreign
                            cards with a new one which makes everything 100
                            times easier. Like Apple Pay, online shopping
                            without useless phone confirmation. I wish I knew
                            this earlier. ”
                          </p>
                          <div className="font-medium text-sm text-slate-500">
                            <span className="text-slate-200">
                              Elisa Koeppel
                            </span>{" "}
                            -{" "}
                            <span className="text-slate-400">
                              CEO & Co-Founder
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card #2 */}
                      <div className="swiper-slide flex flex-col h-auto shadow-2xl text-left">
                        <div className="relative after:absolute after:inset-0 after:bg-gradient-to-t after:from-slate-700">
                          <Image
                            src={Testimonial02}
                            className="md:max-w-none"
                            width={384}
                            height={180}
                            alt="Testiomonial 02"
                          />
                        </div>
                        <div className="grow flex flex-col relative bg-gradient-to-t from-slate-800 to-slate-700 p-6 pt-14">
                          <Image
                            className="absolute bottom-full translate-y-1/2"
                            src={TestimonialSign02}
                            alt="Testiomonial sign 02"
                          />
                          <p className="grow font-medium text-slate-200 mb-4">
                            “ This card allows us to achieve compliance with
                            minimal effort, spend practically no time on
                            payments-related customer support, and keep the user
                            experience on our platform. “
                          </p>
                          <div className="font-medium text-sm text-slate-500">
                            <span className="text-slate-200">Maria Gress</span>{" "}
                            -{" "}
                            <span className="text-slate-400">
                              CEO & Co-Founder
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bullets */}
                  <div className="mt-4">
                    <div className="testimonial-carousel-pagination text-center" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
