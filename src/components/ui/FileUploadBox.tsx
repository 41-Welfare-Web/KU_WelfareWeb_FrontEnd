import { useRef, useState } from "react";
import UploadIcon from "../../assets/plotter/upload.svg";

interface FileUploadBoxProps {
  label: string;
  accept?: string;
  onChange: (file: File) => void;
  onRemove?: () => void;
  file?: File | null;
  helperText?: string;
  className?: string;
}

export default function FileUploadBox({
  label,
  accept = "*",
  onChange,
  onRemove,
  file,
  helperText,
  className = ""
}: FileUploadBoxProps) {
  const inputId = `file-upload-${label.replace(/\s/g, '-')}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inputRef.current) inputRef.current.value = "";
    onRemove?.();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const getAcceptedExtensions = () =>
    accept
      .split(",")
      .map((ext) => ext.trim().replace(".", "").toLowerCase());

  const isFileAccepted = (f: File): boolean => {
    if (accept === "*") return true;
    const exts = getAcceptedExtensions();
    const fileName = f.name.toLowerCase();
    const mimeType = f.type.toLowerCase();
    return exts.some(
      (ext) => fileName.endsWith(`.${ext}`) || mimeType.includes(ext)
    );
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    if (!isFileAccepted(droppedFile)) {
      alert(`허용되지 않는 파일 형식입니다. (허용: ${accept})`);
      return;
    }

    onChange(droppedFile);
  };

  return (
    <div className={`mb-4 md:mb-6 ${className}`}>
      <label className="block text-[16px] md:text-[20px] font-medium text-black mb-2">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          id={inputId}
        />
        {file ? (
          <div className="flex items-center justify-between w-full h-[60px] md:h-[71px] px-4 md:px-6 border border-[#99a1af] rounded-[10px] bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <img src={UploadIcon} alt="File" className="w-5 h-5 flex-shrink-0" />
              <span className="text-[13px] md:text-[15px] text-[#444] truncate">{file.name}</span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="flex-shrink-0 ml-3 text-[13px] md:text-[14px] text-[#e53e3e] border border-[#e53e3e] rounded-md px-3 py-1 hover:bg-red-50"
            >
              취소
            </button>
          </div>
        ) : (
          <label
            htmlFor={inputId}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full h-[120px] md:h-[145px] border border-dashed rounded-[10px] cursor-pointer transition-colors ${
              isDragging
                ? "border-[#e05c2a] bg-orange-50"
                : "border-[#99a1af] bg-white hover:bg-gray-50"
            }`}
          >
            <img src={UploadIcon} alt="Upload" className="w-6 h-6 md:w-7 md:h-7 mb-2 md:mb-3 mt-2 md:mt-3" />
            <p className="text-[13px] md:text-[15px] text-[#868686] mb-2 md:mb-3 px-4 text-center">
              파일을 이곳에 드래그 하거나 클릭하세요
            </p>
            <div className="bg-white border-[0.5px] border-[#a4a4a4] rounded-md px-3 md:px-4 py-1 mb-2">
              <span className="text-[13px] md:text-[15px] text-[#868686]">파일 선택</span>
            </div>
          </label>
        )}
      </div>
      {helperText && (
        <p className="text-[13px] md:text-[15px] text-[#b1b1b1] mt-2 ml-1">
          • {helperText}
        </p>
      )}
    </div>
  );
}

