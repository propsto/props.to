import Image from 'next/image'
import FeatureImage01 from '@/public/images/feature-post-01.png'
import FeatureImage02 from '@/public/images/feature-post-02.png'
import FeatureImage03 from '@/public/images/feature-post-03.png'
import FeatureImage04 from '@/public/images/feature-post-04.png'
import FeatureImage05 from '@/public/images/feature-post-05.png'
import FeatureImage06 from '@/public/images/feature-post-06.png'

export default function Features02() {
  return (
    <section>
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-zinc-900 mb-4">AI-powered features and effects</h2>
            <p className="text-lg text-zinc-500">Whenever you are ready, just hit publish to turn your site sketches into an actual designs. No creating, no skills, no reshaping.</p>
          </div>
          <div className="max-w-sm mx-auto sm:max-w-none grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-4 lg:gap-8">
            <article className="flex flex-col border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg">
              <figure className="relative after:absolute after:bottom-0 after:w-full after:h-1/4 after:bg-gradient-to-t from-zinc-50 from-5%">
                <Image className="w-full" src={FeatureImage01} width={344} height={227.5} alt="Feature Post 01" />
              </figure>
              <div className="grow flex flex-col text-center px-5 py-6">
                <div className="mb-2">
                  <svg className="inline-flex fill-zinc-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                    <path d="M17 9c.6 0 1 .4 1 1v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h6c.6 0 1 .4 1 1s-.4 1-1 1H4v12h12v-6c0-.6.4-1 1-1Zm-.7-6.7c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-8 8c-.2.2-.4.3-.7.3-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l8-8Z" />
                  </svg>
                </div>
                <h3 className="font-inter-tight font-semibold text-zinc-900 text-lg mb-1">Truly Brandable</h3>
                <p className="grow text-zinc-500">Grey makes building graphics easy, fast and fun.</p>
                <div className="mt-5">
                  <a className="btn-sm px-3 py-0.5 text-zinc-600 bg-white hover:text-zinc-900 shadow group" href="#0">
                    Learn More <span className="tracking-normal text-zinc-400 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">-&gt;</span>
                  </a>
                </div>
              </div>
            </article>
            <article className="flex flex-col border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg">
              <figure className="relative after:absolute after:bottom-0 after:w-full after:h-1/4 after:bg-gradient-to-t from-zinc-50 from-5%">
                <Image className="w-full" src={FeatureImage02} width={344} height={227.5} alt="Feature Post 02" />
              </figure>
              <div className="grow flex flex-col text-center px-5 py-6">
                <div className="mb-2">
                  <svg className="inline-flex fill-zinc-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                    <path d="m6.035 17.335-4-14c-.2-.8.5-1.5 1.3-1.3l14 4c.9.3 1 1.5.1 1.9l-6.6 2.9-2.8 6.6c-.5.9-1.7.8-2-.1Zm-1.5-12.8 2.7 9.5 1.9-4.4c.1-.2.3-.4.5-.5l4.4-1.9-9.5-2.7Z" />
                  </svg>
                </div>
                <h3 className="font-inter-tight font-semibold text-zinc-900 text-lg mb-1">Advanced AI</h3>
                <p className="grow text-zinc-500">Grey makes building graphics easy, fast and fun.</p>
                <div className="mt-5">
                  <a className="btn-sm px-3 py-0.5 text-zinc-600 bg-white hover:text-zinc-900 shadow group" href="#0">
                    Learn More <span className="tracking-normal text-zinc-400 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">-&gt;</span>
                  </a>
                </div>
              </div>
            </article>
            <article className="flex flex-col border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg">
              <figure className="relative after:absolute after:bottom-0 after:w-full after:h-1/4 after:bg-gradient-to-t from-zinc-50 from-5%">
                <Image className="w-full" src={FeatureImage03} width={344} height={227.5} alt="Feature Post 03" />
              </figure>
              <div className="grow flex flex-col text-center px-5 py-6">
                <div className="mb-2">
                  <svg className="inline-flex fill-zinc-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                    <path d="M10 15.981H3a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2ZM17 6h-7a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2Zm0 4.981H3a1 1 0 0 1 0-2h14a1 1 0 0 1 0 2Z" />
                  </svg>
                </div>
                <h3 className="font-inter-tight font-semibold text-zinc-900 text-lg mb-1">True Collaboration</h3>
                <p className="grow text-zinc-500">Grey makes building graphics easy, fast and fun.</p>
                <div className="mt-5">
                  <a className="btn-sm px-3 py-0.5 text-zinc-600 bg-white hover:text-zinc-900 shadow group" href="#0">
                    Learn More <span className="tracking-normal text-zinc-400 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">-&gt;</span>
                  </a>
                </div>
              </div>
            </article>
            <article className="flex flex-col border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg">
              <figure className="relative after:absolute after:bottom-0 after:w-full after:h-1/4 after:bg-gradient-to-t from-zinc-50 from-5%">
                <Image className="w-full" src={FeatureImage04} width={344} height={227.5} alt="Feature Post 04" />
              </figure>
              <div className="grow flex flex-col text-center px-5 py-6">
                <div className="mb-2">
                  <svg className="inline-flex fill-zinc-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                    <path d="M8.974 16c-.3 0-.7-.2-.9-.5l-2.2-3.7-2.1 2.8c-.3.4-1 .5-1.4.2-.4-.3-.5-1-.2-1.4l3-4c.2-.3.5-.4.9-.4.3 0 .6.2.8.5l2 3.3 3.3-8.1c0-.4.4-.7.8-.7s.8.2.9.6l4 8c.2.5 0 1.1-.4 1.3-.5.2-1.1 0-1.3-.4l-3-6-3.2 7.9c-.2.4-.6.6-1 .6Z" />
                  </svg>
                </div>
                <h3 className="font-inter-tight font-semibold text-zinc-900 text-lg mb-1">Powerful Effects</h3>
                <p className="grow text-zinc-500">Grey makes building graphics easy, fast and fun.</p>
                <div className="mt-5">
                  <a className="btn-sm px-3 py-0.5 text-zinc-600 bg-white hover:text-zinc-900 shadow group" href="#0">
                    Learn More <span className="tracking-normal text-zinc-400 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">-&gt;</span>
                  </a>
                </div>
              </div>
            </article>
            <article className="flex flex-col border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg">
              <figure className="relative after:absolute after:bottom-0 after:w-full after:h-1/4 after:bg-gradient-to-t from-zinc-50 from-5%">
                <Image className="w-full" src={FeatureImage05} width={344} height={227.5} alt="Feature Post 05" />
              </figure>
              <div className="grow flex flex-col text-center px-5 py-6">
                <div className="mb-2">
                  <svg className="inline-flex fill-zinc-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                    <path d="M9.3 11.7c-.4-.4-.4-1 0-1.4l7-7c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-7 7c-.4.4-1 .4-1.4 0ZM9.3 17.7c-.4-.4-.4-1 0-1.4l7-7c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-7 7c-.4.4-1 .4-1.4 0ZM2.3 12.7c-.4-.4-.4-1 0-1.4l7-7c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-7 7c-.4.4-1 .4-1.4 0Z" />
                  </svg>
                </div>
                <h3 className="font-inter-tight font-semibold text-zinc-900 text-lg mb-1">Precise Control</h3>
                <p className="grow text-zinc-500">Grey makes building graphics easy, fast and fun.</p>
                <div className="mt-5">
                  <a className="btn-sm px-3 py-0.5 text-zinc-600 bg-white hover:text-zinc-900 shadow group" href="#0">
                    Learn More <span className="tracking-normal text-zinc-400 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">-&gt;</span>
                  </a>
                </div>
              </div>
            </article>
            <article className="flex flex-col border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg">
              <figure className="relative after:absolute after:bottom-0 after:w-full after:h-1/4 after:bg-gradient-to-t from-zinc-50 from-5%">
                <Image className="w-full" src={FeatureImage06} width={344} height={227.5} alt="Feature Post 06" />
              </figure>
              <div className="grow flex flex-col text-center px-5 py-6">
                <div className="mb-2">
                  <svg className="inline-flex fill-zinc-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                    <path d="M16 2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h8.667l3.733 2.8A1 1 0 0 0 18 17V4a2 2 0 0 0-2-2Zm0 13-2.4-1.8a1 1 0 0 0-.6-.2H4V4h12v11Z" />
                  </svg>
                </div>
                <h3 className="font-inter-tight font-semibold text-zinc-900 text-lg mb-1">Real-Time Feedback</h3>
                <p className="grow text-zinc-500">Grey makes building graphics easy, fast and fun.</p>
                <div className="mt-5">
                  <a className="btn-sm px-3 py-0.5 text-zinc-600 bg-white hover:text-zinc-900 shadow group" href="#0">
                    Learn More <span className="tracking-normal text-zinc-400 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">-&gt;</span>
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}