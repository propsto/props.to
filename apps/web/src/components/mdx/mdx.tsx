import { useMDXComponent } from "next-contentlayer/hooks";

const mdxComponents = {};

interface MdxProps {
  code: string;
}

export function Mdx({ code }: MdxProps) {
  const Component = useMDXComponent(code);

  return (
    <div className="prose text-slate-500 font-[350] max-w-none prose-p:leading-normal prose-headings:text-slate-800 prose-a:text-blue-500 prose-a:font-[550] prose-a:no-underline hover:prose-a:underline">
      <Component components={{ ...mdxComponents }} />
    </div>
  );
}
