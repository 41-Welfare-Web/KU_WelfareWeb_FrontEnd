import UploadIcon from "../../assets/plotter/upload.svg";

interface FileUploadBoxProps {
  label: string;
  accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file?: File | null;
  helperText?: string;
  className?: string;
}

export default function FileUploadBox({
  label,
  accept = "*",
  onChange,
  file,
  helperText,
  className = ""
}: FileUploadBoxProps) {
  const inputId = `file-upload-${label.replace(/\s/g, '-')}`;

  return (
    <div className={`mb-6 ${className}`}>
      <label className="block text-[20px] font-medium text-black mb-2">{label}</label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={onChange}
          className="hidden"
          id={inputId}
        />
        <label
          htmlFor={inputId}
          className="flex flex-col items-center justify-center w-full h-[145px] border border-dashed border-[#99a1af] rounded-[10px] bg-white cursor-pointer hover:bg-gray-50"
        >
          <img src={UploadIcon} alt="Upload" className="w-[28px] h-[28px] mb-3 mt-3" />
          <p className="text-[15px] text-[#868686] mb-3">
            {file ? file.name : "PDF 파일을 이곳에 드래그 하거나 클릭하세요"}
          </p>
          <div className="bg-white border-[0.5px] border-[#a4a4a4] rounded-[6px] px-4 py-1 mb-2">
            <span className="text-[15px] text-[#868686]">파일 선택</span>
          </div>
        </label>
      </div>
      {helperText && (
        <p className="text-[15px] text-[#b1b1b1] mt-2 ml-1">
          • {helperText}
        </p>
      )}
    </div>
  );
}
