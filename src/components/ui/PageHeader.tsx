interface PageHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

export default function PageHeader({ title, subtitle, className = "" }: PageHeaderProps) {
  return (
    <section className={`w-full pt-12 pb-8 px-4 ${className}`}>
      <div className="max-w-[1440px] mx-auto text-center">
        <h1 className="text-[48px] font-extrabold text-black mb-4">
          {title}
        </h1>
        <p className="text-[28px] text-[#6a7282]">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
