interface SectionHeadProps {
  title: string;
  desc?: string;
  as?: "h1" | "h2" | "h3";
}

export default function SectionHead({ title, desc, as: Tag = "h2" }: SectionHeadProps) {
  return (
    <div className="max-w-2xl">
      <Tag className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</Tag>
      {desc && <p className="mt-4 text-base leading-relaxed text-slate-500">{desc}</p>}
    </div>
  );
}
