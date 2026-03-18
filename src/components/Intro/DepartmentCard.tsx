interface Project {
  title: string;
  description: string;
}

interface DepartmentCardProps {
  icon: string;
  name: string;
  description: string;
  projects: Project[];
}

export default function DepartmentCard({
  icon,
  name,
  description,
  projects,
}: DepartmentCardProps) {
  const normalizedIcon = icon.trim();
  const isImageIcon =
    normalizedIcon.startsWith("data:image/") ||
    /\.(svg|png|jpe?g|webp)(\?.*)?$/i.test(normalizedIcon);

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* 헤더 섹션 */}
      <div className="bg-[#ffdcc5] px-6 py-6 flex items-start gap-4">
        {/* 아이콘 */}
        <div className="flex-shrink-0 bg-white rounded-lg w-20 h-20 flex items-center justify-center shadow-md">
          {isImageIcon ? (
            <img src={icon} alt={`${name} 아이콘`} className="w-12 h-12 object-contain" />
          ) : (
            <span className="text-4xl">{icon}</span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* 국 이름 */}
          <h3 className="text-3xl font-bold text-black mb-3 font-['Gmarket_Sans'] break-words">
            {name}
          </h3>
          
          {/* 설명 */}
          <p className="text-gray-600 text-base leading-relaxed font-['Gmarket_Sans'] break-words">
            {description}
          </p>
        </div>
      </div>

      {/* 주요 사업 섹션 */}
      <div className="px-6 py-8">
        <h4 className="text-xl font-bold text-gray-700 mb-6 font-['Gmarket_Sans']">
          주요 사업
        </h4>

        {/* 사업 그리드 (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-[#ededed] rounded-lg p-5"
            >
              <h5 className="text-lg font-bold text-gray-700 mb-3 font-['Gmarket_Sans'] break-words">
                {project.title}
              </h5>
              <p className="text-gray-600 text-sm leading-relaxed font-['Gmarket_Sans'] break-words">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
