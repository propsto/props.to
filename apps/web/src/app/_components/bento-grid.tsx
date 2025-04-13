export default function BentoGrid(): React.JSX.Element {
  return (
    <section className="relative [background:linear-gradient(#323237,#323237)_padding-box,linear-gradient(120deg,theme(colors.zinc.700),theme(colors.zinc.700),theme(colors.zinc.700))_border-box]">
      <div className="bg-gray-50 py-16 sm:py-16">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <p className="text-center text-base [line-height:1.75rem] font-semibold text-zinc-600">
            Not boring feedback.
          </p>
          <h2 className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
            Open. Capable. Extensible.
          </h2>
          <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-3">
            <div className="relative max-h-[30rem] lg:row-span-2">
              <div className="absolute inset-px rounded-lg bg-[#fef9f1] lg:rounded-l-[2rem]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-lg lg:rounded-l-[calc(2rem+1px)]">
                <div className="px-5 pt-5 pb-3 sm:px-8 sm:pt-4 sm:pb-0">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                    No black boxes. No lock-in.
                  </p>
                  <p className="mt-2 max-w-lg text-sm [line-height:1.5rem] text-gray-600 max-lg:text-center">
                    Props.to is 100% open-source—host it yourself, tweak the
                    code, or contribute to the community.
                  </p>
                </div>
                <div className="relative min-h-[25rem] w-full max-lg:mx-auto max-lg:max-w-sm flex items-center justify-center">
                  <img
                    className="size-10/12 mt-3 object-contain object-center"
                    src="images/vault.png"
                    alt="Open vault"
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-tl-[2rem]" />
            </div>
            <div className="relative max-lg:row-start-1">
              <div className="absolute inset-px rounded-lg bg-blue-50 max-lg:rounded-t-[2rem]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-lg max-lg:rounded-t-[calc(2rem+1px)]">
                <div className="px-4 pt-4 sm:px-6 sm:pt-4">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                    Your credibility, anywhere.
                  </p>
                  <p className="mt-2 max-w-lg text-sm [line-height:1.5rem] text-gray-600 max-lg:text-center">
                    Embed feedback on your LinkedIn, personal site, or portfolio
                    with one snippet. No more dead-end reviews.
                  </p>
                </div>
                <div className="flex flex-1 items-center justify-center px-8 max-lg:pt-10 max-lg:pb-12 sm:px-10 lg:pb-2">
                  <img
                    className="h-48 mt-5 mb-3"
                    src="images/connected.png"
                    alt=""
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-t-[2rem]" />
            </div>
            <div className="relative max-h-[22rem] max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
              <div className="absolute inset-px rounded-lg bg-[#e9e9e9]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-lg">
                <div className="px-4 pt-4 sm:px-6 sm:pt-4">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                    One profile, endless proof.
                  </p>
                  <p className="mt-2 max-w-lg text-sm [line-height:1.5rem] text-gray-600 max-lg:text-center">
                    Merge feedback from companies, clients, or self-hosted
                    instances. No reset buttons, no silos.
                  </p>
                </div>
                <div
                  className="[container-type:inline-size] flex w-full justify-center"
                  style={{ containerType: "inline-size" }}
                >
                  <img
                    className="w-48 mt-2 object-contain"
                    src="images/tree.png"
                    alt=""
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5" />
            </div>
            <div className="relative max-h-[31.5rem] lg:row-span-2">
              <div className="absolute inset-px rounded-lg bg-pink-50/75 max-lg:rounded-b-[2rem] lg:rounded-tr-[2rem]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-lg max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
                <div className="px-6 pt-6 pb-3 sm:px-6 sm:pt-4 sm:pb-0">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                    Feedback that fuels growth.
                  </p>
                  <p className="mt-2 max-w-lg text-sm [line-height:1.5rem] text-gray-600 max-lg:text-center">
                    Create custom categories such as Communication,
                    Adaptability, Innovation, Quality, etc and track your
                    progress across jobs.
                  </p>
                </div>
                <div
                  className="[container-type:inline-size] flex w-full justify-center"
                  style={{ containerType: "inline-size" }}
                >
                  <img
                    className="size-[91%] mt-2 object-contain object-center"
                    src="images/splash.png"
                    alt=""
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-tr-[2rem]" />
            </div>
            <div className="relative -mt-[13.5rem] max-h-[29.5rem] lg:col-start-1 lg:row-start-3">
              <div className="absolute inset-px rounded-lg bg-[#eeedfc] max-lg:rounded-b-[2rem] lg:rounded-bl-[2rem]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-lg">
                <div className="px-4 pt-4 sm:px-6 sm:pt-4">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                    Suggest. Code. Ship.
                  </p>
                  <p className="mt-2 max-w-lg text-sm [line-height:1.5rem] text-gray-600 max-lg:text-center">
                    No red tape. Propose an idea today, see it live next week.
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <img
                    className="-mt-1 w-full object-cover"
                    src="images/roadmap.png"
                    alt=""
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-bl-[2rem]" />
            </div>
            <div className="relative -mt-[12rem] max-h-[28rem] lg:col-start-3 lg:row-start-3">
              <div className="absolute inset-px rounded-lg bg-[#008f1d15] max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-lg">
                <div className="px-4 pt-4 sm:px-6 sm:pt-4">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                    Feedback is just the beginning.
                  </p>
                  <p className="mt-2 max-w-lg text-sm [line-height:1.5rem] text-gray-600 max-lg:text-center">
                    Most platforms stop at collecting feedback. Props.to lets
                    you follow up, clarify, and continue the conversation.
                  </p>
                </div>
                <div className="flex w-full justify-center">
                  <img
                    className="m-5 w-[19rem] object-contain"
                    src="images/actionable.png"
                    alt=""
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]" />
            </div>
            <div className="relative max-h-[16rem] lg:col-start-2 lg:row-start-3">
              <div className="absolute inset-px rounded-lg bg-[rgba(232,251,248,0.34)]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-lg">
                <div className="px-4 pt-4 sm:px-6 sm:pt-4">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                    Dogfood drives progress.
                  </p>
                  <p className="mt-2 max-w-lg text-sm [line-height:1.5rem] text-gray-600 max-lg:text-center">
                    Props.to shapes props.to — because the only way to build
                    something great is to rely on it yourself.
                  </p>
                </div>
                <div className="flex w-full justify-center">
                  <img
                    className="w-64 mt-4 object-contain"
                    src="images/dogfood.png"
                    alt=""
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
