export default function Faqs() {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pb-12 md:pb-20" data-aos="fade-up">
          {/* Section header */}
          <div className="pb-12">
            <h2 className="h2">FAQs</h2>
          </div>

          {/* Columns */}
          <div className="md:flex md:space-x-12 space-y-8 md:space-y-0">
            {/* Column */}
            <div className="w-full md:w-1/2 space-y-8">
              {/* Item */}
              <div className="space-y-2">
                <h4 className="text-xl font-bold">
                  How can I add money to my account?
                </h4>
                <p className="text-slate-500">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua,
                  ut enim ad minim veniam.
                </p>
              </div>

              {/* Item */}
              <div className="space-y-2">
                <h4 className="text-xl font-bold">
                  How is my document data stored/secured?
                </h4>
                <p className="text-slate-500">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua,
                  ut enim ad minim veniam.
                </p>
              </div>

              {/* Item */}
              <div className="space-y-2">
                <h4 className="text-xl font-bold">
                  I do not want to pay now, how can I proceed?
                </h4>
                <p className="text-slate-500">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua,
                  ut enim ad minim veniam.
                </p>
              </div>
            </div>

            {/* Column */}
            <div className="w-full md:w-1/2 space-y-8">
              {/* Item */}
              <div className="space-y-2">
                <h4 className="text-xl font-bold">
                  How do I get started with card payments?
                </h4>
                <p className="text-slate-500">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua,
                  ut enim ad minim veniam.
                </p>
              </div>

              {/* Item */}
              <div className="space-y-2">
                <h4 className="text-xl font-bold">
                  Can I get a standard card for free?
                </h4>
                <p className="text-slate-500">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua,
                  ut enim ad minim veniam.
                </p>
              </div>

              {/* Item */}
              <div className="space-y-2">
                <h4 className="text-xl font-bold">
                  I don't have the required documents, how can I proceed?
                </h4>
                <p className="text-slate-500">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua,
                  ut enim ad minim veniam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
