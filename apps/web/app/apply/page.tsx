import Link from "next/link";
import Image from "next/image";
import Illustration from "@/public/images/hero-illustration.svg";
import LogoFacebook from "@/public/images/logo-facebook.svg";
import LogoNike from "@/public/images/logo-nike.svg";
import LogoSamsung from "@/public/images/logo-samsung.svg";
import LogoDisney from "@/public/images/logo-disney.svg";

export const metadata = {
  title: "Apply - FinTech",
  description: "Page description",
};

export default function Apply() {
  return (
    <>
      <header className="absolute w-full z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Site branding */}
            <div className="shrink-0 mr-4">
              {/* Logo */}
              <Link className="block" href="/" aria-label="Cruip">
                <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                  <g fillRule="nonzero" fill="none">
                    <g className="fill-blue-500" transform="translate(3 3)">
                      <circle cx="5" cy="5" r="5" />
                      <circle cx="19" cy="5" r="5" />
                      <circle cx="5" cy="19" r="5" />
                      <circle cx="19" cy="19" r="5" />
                    </g>
                    <g className="fill-sky-300">
                      <circle cx="15" cy="5" r="5" />
                      <circle cx="25" cy="15" r="5" />
                      <circle cx="15" cy="25" r="5" />
                      <circle cx="5" cy="15" r="5" />
                    </g>
                  </g>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="grow">
        <section>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-36 pb-12 md:pt-40 md:pb-20">
              <div className="lg:flex lg:space-x-12 xl:space-x-16">
                {/* Left side */}
                <div className="grow lg:mt-16 mb-16 lg:mb-0 text-center lg:text-left">
                  <h1 className="h2 mb-8">
                    Build flexible cards for your business
                  </h1>

                  <div className="mb-12">
                    <ul className="inline-flex flex-col text-slate-500 space-y-2.5">
                      <li className="flex items-center text-left">
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
                        <span>
                          Create cards that work exactly as you configured them
                        </span>
                      </li>
                      <li className="flex items-center text-left">
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
                        <span>
                          Focus critical resources on your core business
                        </span>
                      </li>
                      <li className="flex items-center text-left">
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
                        <span>
                          Make real-time decisions on charges and spendings.
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Press logos */}
                  <div className="w-full">
                    <div className="text-xs text-slate-400 font-[350] uppercase tracking-wider text-center lg:text-left mb-5">
                      Trusted bt the best
                    </div>

                    <div className="flex flex-nowrap items-center justify-center lg:justify-start -m-4 lg:-m-2 xl:-m-4">
                      {/* Facebook */}
                      <div className="p-4 lg:p-2 xl:p-4">
                        <Image
                          className="inline-flex max-w-full"
                          src={LogoFacebook}
                          alt="Facebook"
                        />
                      </div>

                      {/* Nike */}
                      <div className="p-4 lg:p-2 xl:p-4">
                        <Image
                          className="inline-flex max-w-full"
                          src={LogoNike}
                          alt="Nike"
                        />
                      </div>

                      {/* Samsung */}
                      <div className="p-4 lg:p-2 xl:p-4">
                        <Image
                          className="inline-flex max-w-full"
                          src={LogoSamsung}
                          alt="Samsung"
                        />
                      </div>

                      {/* Disney */}
                      <div className="p-4 lg:p-2 xl:p-4">
                        <Image
                          className="inline-flex max-w-full"
                          src={LogoDisney}
                          alt="Disney"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="relative shrink-0 text-center lg:text-left">
                  {/* Bg */}
                  <div
                    className="absolute inset-0 mb-44 -mx-4 sm:-mx-6 lg:-mt-[9999px] lg:ml-0 lg:-mr-[9999px] rounded-bl-[100px] bg-gradient-to-tr from-blue-600 to-blue-500 pointer-events-none -z-10"
                    aria-hidden="true"
                  />

                  {/* Illustration */}
                  <Image
                    className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 -mt-40 ml-20 pointer-events-none -z-10 max-w-none mix-blend-lighten"
                    src={Illustration}
                    alt="Illustration"
                    aria-hidden="true"
                  />

                  <div className="flex pt-12 lg:pt-0 lg:pl-12 xl:pl-20">
                    <div className="w-full max-w-[480px] mx-auto lg:w-[480px] lg:max-w-none lg:mx-0 xl:w-[512px] bg-white p-6 shadow-2xl">
                      {/* Form */}
                      <form>
                        <div className="space-y-4">
                          <div className="sm:flex items-start justify-between sm:space-x-4">
                            <label
                              className="block text-sm leading-5 mt-2.5 text-slate-800 font-[550] text-left mb-1.5 sm:mb-0"
                              htmlFor="first-name"
                            >
                              First name
                            </label>
                            <div className="sm:w-72 xl:w-80 shrink-0">
                              <input
                                id="first-name"
                                className="form-input text-sm py-2 w-full"
                                type="text"
                                placeholder="Patrick"
                                required
                              />
                            </div>
                          </div>
                          <div className="sm:flex items-start justify-between sm:space-x-4">
                            <label
                              className="block text-sm leading-5 mt-2.5 text-slate-800 font-[550] text-left mb-1.5 sm:mb-0"
                              htmlFor="last-name"
                            >
                              Last name
                            </label>
                            <div className="sm:w-72 xl:w-80 shrink-0">
                              <input
                                id="last-name"
                                className="form-input text-sm py-2 w-full"
                                type="text"
                                placeholder="Mills"
                                required
                              />
                            </div>
                          </div>
                          <div className="sm:flex items-start justify-between sm:space-x-4">
                            <label
                              className="block text-sm leading-5 mt-2.5 text-slate-800 font-[550] text-left mb-1.5 sm:mb-0"
                              htmlFor="email"
                            >
                              Work email
                            </label>
                            <div className="sm:w-72 xl:w-80 shrink-0">
                              <input
                                id="email"
                                className="form-input text-sm py-2 w-full"
                                type="email"
                                placeholder="patrick@example.com"
                                required
                              />
                            </div>
                          </div>
                          <div className="sm:flex items-start justify-between sm:space-x-4">
                            <label
                              className="block text-sm leading-5 mt-2.5 text-slate-800 font-[550] text-left mb-1.5 sm:mb-0"
                              htmlFor="website"
                            >
                              Website
                            </label>
                            <div className="sm:w-72 xl:w-80 shrink-0">
                              <input
                                id="website"
                                className="form-input text-sm py-2 w-full"
                                type="text"
                                placeholder="example.com"
                                required
                              />
                            </div>
                          </div>
                          <div className="sm:flex items-start justify-between sm:space-x-4">
                            <label
                              className="block text-sm leading-5 mt-2.5 text-slate-800 font-[550] text-left mb-1.5 sm:mb-0"
                              htmlFor="company-size"
                            >
                              Company size
                            </label>
                            <div className="sm:w-72 xl:w-80 shrink-0">
                              <select
                                id="company-size"
                                className="form-select text-sm py-2 w-full"
                                required
                              >
                                <option>Less than 10</option>
                                <option>More than 10</option>
                                <option>More than 20</option>
                                <option>More than 50</option>
                              </select>
                            </div>
                          </div>
                          <div className="sm:flex items-start justify-between sm:space-x-4">
                            <label
                              className="block text-sm leading-5 mt-2.5 text-slate-800 font-[550] text-left mb-1.5 sm:mb-0"
                              htmlFor="country"
                            >
                              Country
                            </label>
                            <div className="sm:w-72 xl:w-80 shrink-0">
                              <select
                                id="country"
                                className="form-select text-sm py-2 w-full"
                                required
                              >
                                <option>United States</option>
                                <option>United Kingdom</option>
                                <option>Germany</option>
                                <option>Italy</option>
                              </select>
                            </div>
                          </div>
                          <div className="sm:flex items-start justify-between sm:space-x-4">
                            <label
                              className="block text-sm leading-5 mt-2.5 text-slate-800 font-[550] text-left mb-1.5 sm:mb-0"
                              htmlFor="comment"
                            >
                              Anything else?
                            </label>
                            <div className="sm:w-72 xl:w-80 shrink-0">
                              <textarea
                                id="comment"
                                className="form-textarea text-sm py-2 w-full"
                                rows={4}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 text-right">
                          <button className="btn-sm inline-flex items-center text-blue-50 bg-blue-500 hover:bg-blue-600 group shadow-sm">
                            Submit the form
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
