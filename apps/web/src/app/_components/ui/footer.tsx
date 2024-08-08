import Link from "next/link";
import Image from "next/image";

export function Footer(): JSX.Element {
  return (
    <footer className="[background:linear-gradient(#323237,#323237)_padding-box,linear-gradient(120deg,theme(colors.zinc.700),theme(colors.zinc.700),theme(colors.zinc.700))_border-box]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top area: Blocks */}
        <div className="py-8 md:py-12 border-t border-zinc-200">
          {/* 1st block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-6 max-sm:order-1 flex flex-col items-center">
            <div className="mb-4">
              {/* Logo */}
              <Link
                className="flex items-center justify-center w-8 h-8"
                href="/"
              >
                <Image src="/props.to.png" width={24} height={24} alt="Logo" />
              </Link>
            </div>
            <div className="grow text-sm text-zinc-200 max-w-[25rem] text-center">
              The symbol <b>人</b> in Asia means &quot;human&quot; representing
              the concept of humanity. It&apos;s also the ASCII version of emoji
              🙏
            </div>
            {/* Social links */}
            <ul className="flex space-x-4 mt-4 mb-1">
              <li>
                <a
                  className="flex justify-center items-center text-zinc-200 hover:text-zinc-500 transition"
                  href="https://x.com/PropsDotTo"
                  aria-label="X"
                >
                  <svg
                    className="fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                  >
                    <path d="m7.063 3 3.495 4.475L14.601 3h2.454l-5.359 5.931L18 17h-4.938l-3.866-4.893L4.771 17H2.316l5.735-6.342L2 3h5.063Zm-.74 1.347H4.866l8.875 11.232h1.36L6.323 4.347Z" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  className="flex justify-center items-center text-zinc-200 hover:text-zinc-500 transition"
                  href="https://github.com/propsto/props.to"
                  aria-label="GitHub"
                >
                  <svg
                    className="fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="19"
                  >
                    <path d="M10.041 0C4.52 0 0 4.382 0 9.737c0 4.3 2.845 7.952 6.862 9.25.502.081.669-.243.669-.487v-1.622c-2.761.568-3.347-1.299-3.347-1.299-.419-1.136-1.088-1.46-1.088-1.46-1.004-.568 0-.568 0-.568 1.004.08 1.506.973 1.506.973.92 1.461 2.343 1.055 2.929.812.084-.65.335-1.055.67-1.298-2.26-.244-4.603-1.055-4.603-4.788 0-1.055.419-1.947 1.004-2.596 0-.325-.418-1.299.168-2.597 0 0 .836-.243 2.761.974.837-.244 1.673-.325 2.51-.325.837 0 1.674.081 2.51.325 1.925-1.298 2.762-.974 2.762-.974.586 1.38.167 2.353.084 2.597.669.649 1.004 1.541 1.004 2.596 0 3.733-2.343 4.544-4.603 4.788.335.324.67.892.67 1.785V18.5c0 .244.167.568.67.487 4.016-1.298 6.86-4.95 6.86-9.25C20.084 4.382 15.565 0 10.042 0Z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          {/* 2nd block 
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-sm text-zinc-800 font-medium mb-2">Company</h6>
            <ul className="text-sm space-y-2">
              <li>
                <a
                  className="text-zinc-500 hover:text-zinc-900 transition"
                  href="#0"
                >
                  About us
                </a>
              </li>
              <li>
                <a
                  className="text-zinc-500 hover:text-zinc-900 transition"
                  href="#0"
                >
                  Diversity & Inclusion
                </a>
              </li>
              <li>
                <a
                  className="text-zinc-500 hover:text-zinc-900 transition"
                  href="#0"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  className="text-zinc-500 hover:text-zinc-900 transition"
                  href="#0"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  className="text-zinc-500 hover:text-zinc-900 transition"
                  href="#0"
                >
                  Financial statements
                </a>
              </li>
            </ul>
          </div>*/}

          {/* 3rd block 
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-sm text-zinc-800 font-medium mb-2">
              Resources
            </h6>
            <ul className="text-sm space-y-2">
              <li>
                <a
                  className="text-zinc-500 hover:text-zinc-900 transition"
                  href="#0"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  className="text-zinc-500 hover:text-zinc-900 transition"
                  href="#0"
                >
                  Terms of service
                </a>
              </li>
              <li>
                <a
                  className="text-zinc-500 hover:text-zinc-900 transition"
                  href="#0"
                >
                  Collaboration features
                </a>
              </li>
            </ul>
          </div>*/}

          {/* 4th block 
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-sm text-zinc-800 font-medium mb-2">Legals</h6>
            <ul className="text-sm space-y-2">
              <li>
                <a
                  className="text-zinc-500 hover:text-zinc-900 transition"
                  href="#0"
                >
                  Refund policy
                </a>
              </li>
              <li>
                <a
                  className="text-zinc-500 hover:text-zinc-900 transition"
                  href="https://docs.props.to/terms-and-conditions"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  className="text-zinc-500 hover:text-zinc-900 transition"
                  href="#0"
                >
                  Privacy policy
                </a>
              </li>
              <li>
                <a
                  className="text-zinc-500 hover:text-zinc-900 transition"
                  href="#0"
                >
                  Brand Kit
                </a>
              </li>
            </ul>
          </div>*/}
        </div>
      </div>
    </footer>
  );
}
