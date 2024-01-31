import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/props.to.png";

export default function Footer() {
  return (
    <footer>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top area: Blocks */}
        <div className="grid sm:grid-cols-12 gap-8 py-8 md:py-12 border-t border-zinc-200">
          {/* 1st block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-6 max-sm:order-1 flex flex-col">
            <div className="mb-4">
              {/* Logo */}
              <Link
                className="flex items-center justify-center w-8 h-8"
                href="/"
              >
                <Image src={Logo} width={24} height={24} alt="Logo" />
              </Link>
            </div>
            <div className="grow text-sm text-zinc-500 max-w-sm">
              The symbol <b>人</b> in Chinese, Japanese, and some other East
              Asian languages means "person" or "human being." It represents the
              concept of humanity. It's also de ASCII version of emoji 🙏
            </div>
            {/* Social links */}
            <ul className="flex space-x-4 mt-4 mb-1">
              <li>
                <a
                  className="flex justify-center items-center text-zinc-700 hover:text-zinc-900 transition"
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
            </ul>
          </div>

          {/* 2nd block */}
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
          </div>

          {/* 3rd block */}
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
          </div>

          {/* 4th block */}
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
                  href="#0"
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
          </div>
        </div>
      </div>
    </footer>
  );
}
