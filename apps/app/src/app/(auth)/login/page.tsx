import Link from "next/link";

export const metadata = {
  title: "Log in - Creative",
  description: "Page description",
};

export default function Login() {
  return (
    <>
      {/* Page header */}
      <div className="mx-auto max-w-3xl pb-12 text-center md:pb-16">
        <h1 className="font-inter-tight bg-gradient-to-r from-zinc-500 via-zinc-900 to-zinc-900 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          Log in to Props.to
        </h1>
      </div>

      {/* Form */}
      <div className="relative mx-auto max-w-[25rem] rounded-lg bg-gradient-to-b from-zinc-100 to-zinc-50/70 p-6 shadow-2xl before:absolute before:-left-16 before:-top-12 before:-z-10 before:h-96 before:w-96 before:rounded-full before:bg-zinc-900 before:opacity-[.15] before:blur-3xl">
        <form>
          <div className="space-y-4">
            <div>
              <label
                className="mb-2 block text-sm font-medium text-zinc-800"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                className="form-input w-full text-sm"
                type="email"
                placeholder="mark@acmecorp.com"
                required
              />
            </div>
            <div>
              <div className="flex justify-between">
                <label
                  className="mb-2 block text-sm font-medium text-zinc-800"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  className="ml-2 text-sm font-medium text-zinc-500 underline hover:no-underline"
                  href="/reset-password"
                >
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                className="form-input w-full text-sm"
                type="password"
                required
              />
            </div>
          </div>
          <div className="mt-5">
            <button className="btn w-full bg-zinc-900 text-zinc-100 shadow hover:bg-zinc-800">
              Log in
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center before:mr-3 before:grow before:border-t before:border-zinc-200 after:ml-3 after:grow after:border-t after:border-zinc-200">
          <div className="text-xs italic text-zinc-400">Or</div>
        </div>

        {/* Social login */}
        <button className="btn group relative flex w-full bg-white text-zinc-600 shadow after:flex-1 hover:text-zinc-900">
          <div className="flex flex-1 items-center">
            <svg
              className="h-4 w-4 shrink-0 fill-zinc-400 transition group-hover:fill-rose-500"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15.679 6.545H8.043v3.273h4.328c-.692 2.182-2.401 2.91-4.363 2.91a4.727 4.727 0 1 1 3.035-8.347l2.378-2.265A8 8 0 1 0 8.008 16c4.41 0 8.4-2.909 7.67-9.455Z" />
            </svg>
          </div>
          <span className="flex-auto pl-3">Continue With Google</span>
        </button>

        <div className="mt-6 text-center">
          <div className="text-xs text-zinc-500">
            By loggin in you agree with our{" "}
            <a className="underline hover:no-underline" href="#0">
              Terms
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
