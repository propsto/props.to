import Link from "next/link";
import Image from "next/image";
import Illustration from "@/public/images/footer-illustration.svg";

export default function Footer() {
  return (
    <footer className="relative">
      {/* Bg */}
      <div className="absolute inset-0 bg-slate-800 -z-10" aria-hidden="true" />

      {/* Illustration */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none -z-10"
        aria-hidden="true"
      >
        <Image
          className="max-w-none"
          src={Illustration}
          alt="Footer illustration"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Blocks */}
        <div className="grid sm:grid-cols-12 lg:grid-cols-10 gap-8 py-8 border-t border-slate-700">
          {/* 1st block */}
          <div className="sm:col-span-12 lg:col-span-2 lg:max-w-xs">
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

          {/* 2nd block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-sm text-slate-100 font-bold mb-3">
              Essentials
            </h6>
            <ul className="text-sm font-[450] space-y-2">
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  Payments
                </a>
              </li>
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  Budgeting and analytics
                </a>
              </li>
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  Open banking
                </a>
              </li>
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  Pockets
                </a>
              </li>
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  Subscriptions
                </a>
              </li>
            </ul>
          </div>

          {/* 3rd block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-sm text-slate-100 font-bold mb-3">Company</h6>
            <ul className="text-sm font-[450] space-y-2">
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  About us
                </a>
              </li>
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  Diversity / Inclusion
                </a>
              </li>
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  Sustainability
                </a>
              </li>
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  Code of conduct
                </a>
              </li>
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  Financial statements
                </a>
              </li>
            </ul>
          </div>

          {/* 4th block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-sm text-slate-100 font-bold mb-3">Lifestyle</h6>
            <ul className="text-sm font-[450] space-y-2">
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  International products
                </a>
              </li>
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  Currency exchange
                </a>
              </li>
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  Lounge & Smart delay
                </a>
              </li>
            </ul>
          </div>

          {/* 5th block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-sm text-slate-100 font-bold mb-3">Company</h6>
            <ul className="text-sm font-[450] space-y-2">
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  Send us an email
                </a>
              </li>
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  className="text-slate-400 hover:text-blue-500 transition duration-150 ease-in-out"
                  href="#0"
                >
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom area */}
        <div className="pb-4 md:pb-8">
          <div className="text-xs text-slate-500">
            If you would like to find out more about which entity you receive
            services from please click{" "}
            <a
              className="font-medium underline hover:text-blue-500 transition duration-150 ease-in-out"
              href="#0"
            >
              here
            </a>{" "}
            If you have any other questions, please reach out to us via the
            in-app chat. Custom Bank is a bank established in the Republic of
            Ireland. Custom Bank is licensed by the European Central Bank and
            regulated by the Bank of Ireland. Cusom Bank provides credit,
            payment, current account and demand deposit account services.
          </div>
        </div>
      </div>
    </footer>
  );
}
