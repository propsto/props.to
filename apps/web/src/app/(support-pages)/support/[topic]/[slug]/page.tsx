import type { Metadata } from "next";
import { allPosts } from "contentlayer/generated";
import { notFound } from "next/navigation";
import { Mdx } from "@/components/mdx/mdx";
import Hamburger from "./hamburger";
import SupportFooter from "./footer";

export async function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | undefined> {
  const post = allPosts.find((post) => post.slug === params.slug);

  if (!post) return;

  const { title, summary: description } = post;

  return {
    title,
    description,
  };
}

export default async function SinglePost({
  params,
}: {
  params: {
    topic: string;
    slug: string;
  };
}) {
  const post = allPosts.find((post) => post.slug === params.slug);

  if (!post) notFound();

  return (
    <div className="md:grow md:pl-[21rem]">
      <div className="pt-28 pb-12 md:pt-36 md:pb-16">
        <div className="md:hidden flex items-center mb-8">
          <Hamburger />

          {/* Breadcrumbs */}
          <div className="flex items-center text-sm whitespace-nowrap min-w-0 ml-3">
            <span className="text-slate-500">{post.topic.name}</span>
            <svg
              className="h-3 w-3 shrink-0 fill-slate-400 mx-2"
              viewBox="0 0 16 16"
            >
              <path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z"></path>
            </svg>
            <span className="text-slate-800 font-medium truncate">
              {post.title}
            </span>
          </div>
        </div>

        <article>
          <div className="flex items-center mb-4">
            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id="a">
                  <stop stopColor="#2563EB" offset="0%" />
                  <stop stopColor="#3B82F6" offset="100%" />
                </linearGradient>
              </defs>
              <g fill="none" fillRule="evenodd">
                <path
                  d="M6 22c-.101 0 2.023-8.649 2.023-8.649a.498.498 0 0 1 .83-.204l3.5 3.5a.5.5 0 0 1-.053.753l-6 4.5a.496.496 0 0 1-.3.1Z"
                  fill="#1D4ED8"
                />
                <path
                  d="M17.496 23a.499.499 0 0 1-.3-.1L1.2 10.9a.498.498 0 0 1 .114-.864l20-8a.5.5 0 0 1 .676.562l-4.004 20a.5.5 0 0 1-.49.402Z"
                  fill="url(#a)"
                  fillRule="nonzero"
                />
                <path
                  d="M6 22a.498.498 0 0 1-.5-.5V14a.5.5 0 0 1 .202-.401l15.5-11.5a.5.5 0 0 1 .645.761L8.099 16.075l-1.625 5.583A.5.5 0 0 1 6 22Z"
                  fill="#7DD3FC"
                  fillRule="nonzero"
                />
              </g>
            </svg>
            <span className="text-lg font-bold text-slate-800 ml-2.5">
              {post.topic.name}
            </span>
          </div>
          <h1 className="h3 text-slate-800 mb-4">{post.title}</h1>
          <Mdx code={post.body.code} />
        </article>

        <SupportFooter />
      </div>
    </div>
  );
}
