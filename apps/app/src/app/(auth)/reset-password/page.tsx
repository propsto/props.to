export const metadata = {
  title: "Reset Password - Creative",
  description: "Page description",
};

export default function ResetPassword() {
  return (
    <>
      {/* Page header */}
      <div className="mx-auto max-w-3xl pb-12 text-center md:pb-16">
        <h1 className="font-inter-tight bg-gradient-to-r from-zinc-500 via-zinc-900 to-zinc-900 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          Reset your password
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
          </div>
          <div className="mt-5">
            <button className="btn w-full bg-zinc-900 text-zinc-100 shadow hover:bg-zinc-800">
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
