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
  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* 헤더 섹션 */}
      <div className="bg-[#ffdcc5] px-6 py-6 flex items-start gap-4">
        {/* 아이콘 */}
        <div className="flex-shrink-0 bg-white rounded-lg w-20 h-20 flex items-center justify-center shadow-md">
          <span className="text-4xl">{icon}</span>
        </div>
        
        <div className="flex-1">
          {/* 국 이름 */}
          <h3 className="text-3xl font-bold text-black mb-3 font-['Gmarket_Sans']">
            {name}
          </h3>
          
          {/* 설명 */}
          <p className="text-gray-600 text-base leading-relaxed font-['Gmarket_Sans']">
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
              <h5 className="text-lg font-bold text-gray-700 mb-3 font-['Gmarket_Sans']">
                {project.title}
              </h5>
              <p className="text-gray-600 text-sm leading-relaxed font-['Gmarket_Sans']">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
