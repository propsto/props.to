import Link from "next/link";
import Image from "next/image";
import { Button } from "@propsto/ui/atoms/button";

export function Cta(): React.ReactElement {
  return (
    <section>
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto text-center pb-12 md:pb-16">
            <div className="">
              <Link href="/">
                <Image
                  src="/images/logo-02.png"
                  width={60}
                  height={60}
                  alt="Logo"
                />
              </Link>
            </div>
            <h2 className="font-cal text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              Start your journey&nbsp;
              <em className="relative not-italic inline-flex justify-center items-end">
                today
                <svg
                  className="absolute fill-zinc-300 w-[calc(100%+1rem)] -z-10"
                  xmlns="http://www.w3.org/2000/svg"
                  width="120"
                  height="10"
                  viewBox="0 0 120 10"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <path d="M118.273 6.09C79.243 4.558 40.297 5.459 1.305 9.034c-1.507.13-1.742-1.521-.199-1.81C39.81-.228 79.647-1.568 118.443 4.2c1.63.233 1.377 1.943-.17 1.89Z" />
                </svg>
              </em>
            </h2>
            <p className="text-lg text-zinc-500 mb-8">
              Gray removes creative distances by connecting beginners, pros, and
              every team in between. Are you ready to start your journey?
            </p>
            <div className="max-w-xs mx-auto sm:max-w-none sm:inline-flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div>
                <Button asChild>
                  <Link href="/request-early-access">Request early access</Link>
                </Button>
              </div>
              <div>
                <Button asChild variant="outline">
                  <Link href="https://git.new/propsto">Contribute</Link>
                </Button>
              </div>
            </div>
          </div>
          {/* Clients 
          <div className="text-center">
            <ul className="inline-flex flex-wrap items-center justify-center -m-3">
              <li className="m-3">
                <svg
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="Adobe"
                >
                  <path d="m21.966 31-1.69-4.231h-4.154l3.892-9.037L25.676 31h-3.71Zm-5.082-21H8v21l8.884-21ZM32 10h-8.884L32 31V10Z" />
                </svg>
              </li>
              <li className="m-3">
                <svg
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="Unsplash"
                >
                  <path d="M16.119 9h8.762v6.571h-8.762zM24.881 18.857H32V32H9V18.857h7.119v6.572h8.762z" />
                </svg>
              </li>
              <li className="m-3">
                <svg
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="Google"
                >
                  <path d="M8.407 26.488a13.458 13.458 0 0 1 0-11.98A13.48 13.48 0 0 1 29.63 10.57l-4.012 3.821a7.934 7.934 0 0 0-5.12-1.87 7.986 7.986 0 0 0-7.568 5.473 7.94 7.94 0 0 0-.408 2.504A7.94 7.94 0 0 0 12.93 23a7.986 7.986 0 0 0 7.567 5.472 8.577 8.577 0 0 0 4.566-1.127l4.489 3.459a13.415 13.415 0 0 1-9.055 3.19 13.512 13.512 0 0 1-12.09-7.507Zm25.036-8.444c.664 6.002-1.021 10.188-3.89 12.762l-4.488-3.46a6.581 6.581 0 0 0 2.795-3.78h-7.301v-5.522h12.884Z" />
                </svg>
              </li>
              <li className="m-3">
                <svg
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="WordPress"
                >
                  <path d="M8.061 20.5c0-1.804.387-3.516 1.077-5.063l5.934 16.257c-4.15-2.016-7.01-6.271-7.01-11.194Zm20.836-.628c0 1.065-.41 2.3-.946 4.021L26.71 28.04l-4.496-13.371c.749-.04 1.424-.119 1.424-.119.67-.079.591-1.064-.08-1.025 0 0-2.014.158-3.315.158-1.222 0-3.276-.158-3.276-.158-.67-.039-.75.986-.079 1.025 0 0 .635.08 1.305.119l1.938 5.31-2.723 8.163-4.53-13.473c.75-.04 1.424-.119 1.424-.119.67-.079.591-1.064-.08-1.025 0 0-2.014.158-3.314.158-.234 0-.509-.005-.801-.015A12.425 12.425 0 0 1 20.5 8.061c3.238 0 6.187 1.238 8.4 3.266-.054-.004-.106-.01-.162-.01-1.221 0-2.088 1.064-2.088 2.207 0 1.025.591 1.893 1.221 2.918.474.828 1.026 1.892 1.026 3.43Zm-8.179 1.716 3.824 10.475c.025.061.056.118.089.171a12.434 12.434 0 0 1-7.645.198l3.732-10.844Zm10.697-7.056a12.378 12.378 0 0 1 1.524 5.968c0 4.589-2.487 8.595-6.185 10.751l3.799-10.985c.71-1.774.946-3.193.946-4.455 0-.458-.03-.883-.084-1.279ZM20.5 6C28.495 6 35 12.504 35 20.5 35 28.495 28.495 35 20.5 35S6 28.495 6 20.5C6 12.504 12.505 6 20.5 6Zm0 28.335c7.628 0 13.835-6.207 13.835-13.835 0-7.629-6.207-13.835-13.835-13.835-7.629 0-13.835 6.206-13.835 13.835 0 7.628 6.206 13.835 13.835 13.835Z" />
                </svg>
              </li>
              <li className="m-3">
                <svg
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="Slack"
                >
                  <path d="M16.533 7a2.6 2.6 0 1 0 0 5.2h2.6V9.6a2.6 2.6 0 0 0-2.6-2.6M16.533 13.933H9.6a2.6 2.6 0 1 0 0 5.2h6.934a2.6 2.6 0 0 0 0-5.2M33 16.534a2.6 2.6 0 0 0-5.2 0v2.6h2.6a2.6 2.6 0 0 0 2.6-2.6M26.067 16.534V9.6a2.6 2.6 0 1 0-5.2 0v6.933a2.6 2.6 0 0 0 5.2 0M23.466 33a2.6 2.6 0 1 0 0-5.2h-2.6v2.6a2.6 2.6 0 0 0 2.6 2.6M23.466 26.067H30.4a2.6 2.6 0 1 0 0-5.2h-6.934a2.6 2.6 0 0 0 0 5.2M7 23.466a2.6 2.6 0 1 0 5.2 0v-2.6H9.6a2.6 2.6 0 0 0-2.6 2.6M13.933 23.466V30.4a2.6 2.6 0 0 0 5.2 0v-6.934a2.6 2.6 0 0 0-5.2 0" />
                </svg>
              </li>
              <li className="m-3">
                <svg
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="Pinterest"
                >
                  <path d="M19.482 6.455c-7.757 0-14.045 6.288-14.045 14.045 0 5.95 3.702 11.032 8.926 13.079-.123-1.112-.233-2.816.05-4.03.254-1.095 1.646-6.98 1.646-6.98s-.42-.842-.42-2.086c0-1.953 1.132-3.41 2.541-3.41 1.198 0 1.777.899 1.777 1.978 0 1.205-.767 3.006-1.163 4.676-.33 1.398.701 2.538 2.08 2.538 2.496 0 4.415-2.632 4.415-6.431 0-3.363-2.416-5.714-5.867-5.714-3.996 0-6.342 2.997-6.342 6.095 0 1.207.466 2.501 1.046 3.205a.42.42 0 0 1 .097.403c-.107.443-.343 1.397-.39 1.592-.061.258-.204.312-.47.188-1.754-.816-2.85-3.38-2.85-5.44 0-4.431 3.218-8.5 9.28-8.5 4.872 0 8.658 3.472 8.658 8.112 0 4.84-3.052 8.736-7.288 8.736-1.423 0-2.761-.74-3.22-1.613l-.874 3.339c-.317 1.22-1.173 2.749-1.746 3.682a14.04 14.04 0 0 0 4.159.626c7.757 0 14.045-6.288 14.045-14.045S27.238 6.455 19.482 6.455Z" />
                </svg>
              </li>
              <li className="m-3">
                <svg
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="Amazon"
                >
                  <path d="M5.055 27.164c.09-.146.236-.155.436-.028 4.545 2.637 9.49 3.955 14.836 3.955 3.564 0 7.082-.664 10.555-1.991.09-.036.223-.09.395-.164.173-.072.296-.127.368-.163.273-.11.487-.055.641.163.155.219.105.419-.15.6-.327.237-.745.51-1.254.819-1.564.927-3.31 1.645-5.237 2.154-1.927.51-3.809.764-5.645.764-2.836 0-5.518-.496-8.045-1.487A22.154 22.154 0 0 1 5.164 27.6c-.11-.09-.164-.182-.164-.273 0-.054.018-.109.055-.163Zm8.209-7.773c0-1.255.309-2.327.927-3.218.618-.891 1.464-1.564 2.536-2.018.982-.419 2.191-.719 3.628-.9.49-.055 1.29-.128 2.4-.219v-.463c0-1.164-.128-1.946-.382-2.346-.382-.545-.982-.818-1.8-.818h-.218c-.6.055-1.119.246-1.555.573-.436.327-.718.782-.845 1.363-.073.364-.255.573-.546.628l-3.136-.382c-.31-.073-.464-.236-.464-.491a.8.8 0 0 1 .027-.19c.31-1.62 1.069-2.82 2.278-3.6 1.209-.783 2.622-1.22 4.24-1.31h.682c2.073 0 3.691.536 4.855 1.61.182.182.351.378.504.585.155.21.278.396.369.56.09.163.172.4.245.709.073.309.127.522.164.64.036.119.063.373.082.764.018.391.027.623.027.696v6.6c0 .472.068.904.204 1.295.137.391.269.673.396.846.127.172.336.45.627.831.11.164.164.31.164.437 0 .145-.073.272-.218.382L26 24.082c-.218.163-.482.182-.79.054a9.223 9.223 0 0 1-.67-.627c-.19-.2-.326-.345-.408-.436a6.09 6.09 0 0 1-.396-.532c-.181-.264-.309-.441-.381-.532-1.019 1.11-2.019 1.8-3 2.073-.619.182-1.382.273-2.291.273-1.4 0-2.55-.432-3.45-1.296-.9-.864-1.35-2.086-1.35-3.668Zm4.69-.546c0 .71.178 1.278.532 1.705.355.427.832.64 1.432.64.055 0 .132-.008.232-.026.1-.019.168-.028.205-.028.763-.2 1.354-.69 1.772-1.472.2-.346.35-.723.45-1.132.1-.41.155-.741.164-.996.009-.254.014-.672.014-1.254V15.6c-1.055 0-1.855.073-2.4.218-1.6.455-2.4 1.464-2.4 3.027Zm11.455 8.782a.854.854 0 0 1 .164-.218c.454-.309.89-.518 1.309-.627a8.891 8.891 0 0 1 2.018-.3c.182-.018.355-.01.518.027.818.073 1.31.21 1.473.41.073.108.109.272.109.49v.191c0 .636-.173 1.386-.518 2.25-.346.864-.827 1.56-1.446 2.086-.09.073-.172.11-.245.11a.242.242 0 0 1-.11-.028c-.108-.054-.136-.154-.081-.3.673-1.582 1.01-2.682 1.01-3.3 0-.2-.037-.345-.11-.436-.182-.218-.69-.327-1.527-.327-.31 0-.673.018-1.091.054-.455.055-.873.11-1.255.164-.109 0-.182-.018-.218-.055-.036-.036-.045-.073-.027-.109a.21.21 0 0 1 .027-.082Z" />
                </svg>
              </li>
              <li className="m-3">
                <svg
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="Windows"
                >
                  <path d="m8 11.408 9.808-1.335.004 9.46-9.803.056L8 11.41Zm9.803 9.215.008 9.47-9.803-1.348-.001-8.185 9.796.063Zm1.19-10.725L31.996 8v11.413l-13.005.103V9.898ZM32 20.712l-.003 11.362-13.005-1.835-.018-9.548L32 20.712Z" />
                </svg>
              </li>
            </ul>
          </div>*/}
        </div>
      </div>
    </section>
  );
}
