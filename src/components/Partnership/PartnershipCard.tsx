export type PartnershipCardItem = {
  id: number;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
};

type Props = {
  item: PartnershipCardItem;
};

export default function PartnershipCard({ item }: Props) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noreferrer"
      className="group block overflow-hidden rounded-[18px] border border-[1.5px] border-[#FF8A65] bg-[#FFF7F3] transition hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(65,15,7,0.12)]"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-[#F7D8C7]">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-col items-start px-4 sm:px-5 py-4 sm:py-5 text-left">
        <span className="inline-flex rounded-full bg-[#FF7A57] px-2.5 py-1 text-[10px] sm:text-[11px] md:text-[12px] font-semibold text-white">
          {item.category}
        </span>

        <h3 className="mt-3 text-[18px] sm:text-[20px] md:text-[24px] font-bold text-[#410F07] leading-snug text-left">
          {item.title}
        </h3>

        <p className="mt-2 text-[12px] sm:text-[13px] md:text-[14px] text-[#5F352E] leading-[1.6] text-left">
          {item.description}
        </p>
      </div>
    </a>
  );
}
