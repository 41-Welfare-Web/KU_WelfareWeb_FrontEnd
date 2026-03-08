import { useEffect, useMemo, useRef, useState } from "react";
import cancel from "../../assets/rental/cancel-white.svg";
import { getCategories } from "../../api/rental/rentalApi";
import type { Category } from "../../api/rental/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: {
    name: string;
    categoryId: number | null;
    totalQuantity: number;
    description: string;
    usageVideoType: "url" | "file";
    usageVideoUrl: string;
    usageVideoFile: File | null;
    imageFiles: File[];
  }) => void | Promise<void>;
};

export default function AdminItemCreateModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [totalQuantity, setTotalQuantity] = useState("0");
  const [description, setDescription] = useState("");

  const [usageVideoType, setUsageVideoType] = useState<"url" | "file">("url");
  const [usageVideoUrl, setUsageVideoUrl] = useState("");
  const [usageVideoFile, setUsageVideoFile] = useState<File | null>(null);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let alive = true;

    setCategoriesLoading(true);
    setCategoriesError(null);

    getCategories()
      .then((data) => {
        if (!alive) return;
        setCategories(data ?? []);
        setCategoryId(data?.[0]?.id ?? null);
      })
      .catch((e) => {
        if (!alive) return;
        setCategoriesError(
          e instanceof Error ? e.message : "카테고리를 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (!alive) return;
        setCategoriesLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setName("");
    setTotalQuantity("0");
    setDescription("");
    setUsageVideoType("url");
    setUsageVideoUrl("");
    setUsageVideoFile(null);
    setImageFiles([]);
    setImagePreviews([]);
    setCurrentImageIndex(0);
    setError(null);
    setSubmitLoading(false);
  }, [open]);

  useEffect(() => {
    if (!imageFiles.length) {
      setImagePreviews([]);
      setCurrentImageIndex(0);
      return;
    }

    const objectUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(objectUrls);

    if (currentImageIndex >= objectUrls.length) {
      setCurrentImageIndex(0);
    }

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles, currentImageIndex]);

  const parsedQuantity = useMemo(() => {
    const n = Number(totalQuantity);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.floor(n);
  }, [totalQuantity]);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!categoryId) return false;
    if (parsedQuantity < 0) return false;
    if (!description.trim()) return false;
    return true;
  }, [name, categoryId, parsedQuantity, description]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setImageFiles((prev) => [...prev, ...files]);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imagePreviews.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === imagePreviews.length - 1 ? 0 : prev + 1,
    );
  };

  const handleRemoveCurrentImage = () => {
    if (!imageFiles.length) return;

    setImageFiles((prev) => prev.filter((_, idx) => idx !== currentImageIndex));

    setCurrentImageIndex((prev) => {
      if (prev <= 0) return 0;
      return prev - 1;
    });
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setUsageVideoFile(file);
  };

  const handleSubmit = async () => {
    if (submitLoading) return;
    setError(null);

    try {
      if (!name.trim()) throw new Error("물품 이름을 입력해주세요.");
      if (!categoryId) throw new Error("카테고리를 선택해주세요.");
      if (parsedQuantity < 0) throw new Error("총 보유 수량을 확인해주세요.");
      if (!description.trim()) throw new Error("상세 설명을 입력해주세요.");

      setSubmitLoading(true);

      await onSubmit?.({
        name: name.trim(),
        categoryId,
        totalQuantity: parsedQuantity,
        description: description.trim(),
        usageVideoType,
        usageVideoUrl: usageVideoUrl.trim(),
        usageVideoFile,
        imageFiles,
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "신규 물품 등록에 실패했습니다.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[min(920px,96vw)] max-h-[90dvh] overflow-hidden rounded-[28px] bg-[#F7F7F7] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between bg-[#001A37] px-5 sm:px-8 py-4 sm:py-6">
          <div className="text-[24px] sm:text-[clamp(28px,3vw,40px)] font-extrabold text-white">
            신규 물품 등록
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center"
            aria-label="닫기"
          >
            <img
              src={cancel}
              alt="닫기"
              className="h-7 w-7 sm:h-9 sm:w-9 object-contain"
            />
          </button>
        </div>

        <div className="max-h-[calc(90dvh-96px)] overflow-y-auto px-5 sm:px-10 py-6 sm:py-8">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {categoriesError && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {categoriesError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 sm:gap-8">
            <div>
              <div className="mb-3 text-[18px] sm:text-[22px] font-bold text-black">
                대표 이미지
              </div>

              <div className="rounded-[20px] bg-white p-3 sm:p-4">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="group relative flex h-[240px] sm:h-[280px] lg:h-[320px] w-full items-center justify-center rounded-[20px] border-2 border-dashed border-black/20 bg-white text-center transition hover:bg-black/[0.02] overflow-hidden"
                >
                  {imagePreviews.length > 0 ? (
                    <>
                      <div className="flex h-full w-full items-center justify-center p-4 sm:p-6">
                        <img
                          src={imagePreviews[currentImageIndex]}
                          alt={`대표 이미지 ${currentImageIndex + 1}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {imagePreviews.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrevImage();
                            }}
                            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/45 text-white text-lg sm:text-xl"
                            aria-label="이전 이미지"
                          >
                            ‹
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNextImage();
                            }}
                            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/45 text-white text-lg sm:text-xl"
                            aria-label="다음 이미지"
                          >
                            ›
                          </button>
                        </>
                      )}

                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs sm:text-sm text-white">
                        {currentImageIndex + 1} / {imagePreviews.length}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCurrentImage();
                        }}
                        className="absolute top-2 right-2 rounded-full bg-black/55 px-2.5 py-1 text-xs sm:text-sm text-white"
                      >
                        삭제
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-black/35 px-4">
                      <div className="text-[44px] sm:text-[52px] leading-none">
                        ⊕
                      </div>
                      <div className="mt-3 text-[18px] sm:text-[24px] font-semibold">
                        클릭하여 업로드
                      </div>
                      <div className="mt-1 text-[12px] sm:text-sm">
                        여러 장 첨부 가능
                      </div>
                    </div>
                  )}
                </button>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />

                {imageFiles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {imageFiles.map((file, idx) => (
                      <button
                        key={`${file.name}-${idx}`}
                        type="button"
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`rounded-full px-3 py-1 text-xs sm:text-sm border transition ${
                          idx === currentImageIndex
                            ? "bg-[#001A37] text-white border-[#001A37]"
                            : "bg-white text-black/70 border-black/15"
                        }`}
                      >
                        이미지 {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-[18px] sm:text-[22px] font-bold text-black">
                    물품 이름
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 대형 돗자리"
                    className="w-full rounded-2xl border border-black/30 bg-white px-4 sm:px-5 py-3 sm:py-4 text-[16px] sm:text-[18px] text-black outline-none placeholder:text-black/30 focus:border-[#001A37]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[18px] sm:text-[22px] font-bold text-black">
                    카테고리
                  </label>
                  <select
                    value={categoryId ?? ""}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    disabled={categoriesLoading}
                    className="w-full rounded-2xl border border-black/30 bg-white px-4 sm:px-5 py-3 sm:py-4 text-[16px] sm:text-[18px] text-black outline-none focus:border-[#001A37] disabled:opacity-60"
                  >
                    <option value="">
                      {categoriesLoading ? "불러오는 중..." : "카테고리 선택"}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[18px] sm:text-[22px] font-bold text-black">
                    총 보유 수량
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={totalQuantity}
                    onChange={(e) => setTotalQuantity(e.target.value)}
                    className="w-full rounded-2xl border border-black/30 bg-white px-4 sm:px-5 py-3 sm:py-4 text-[16px] sm:text-[18px] text-black outline-none focus:border-[#001A37]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-[18px] sm:text-[22px] font-bold text-black">
                    상세 설명
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="물품에 대한 상세한 설명을 적어주세요"
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-black/30 bg-white px-4 sm:px-5 py-3 sm:py-4 text-[16px] sm:text-[18px] text-black outline-none placeholder:text-black/30 focus:border-[#001A37]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-[18px] sm:text-[22px] font-bold text-black">
                    사용법 영상 (URL or 영상)
                  </label>

                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUsageVideoType("url")}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        usageVideoType === "url"
                          ? "bg-[#001A37] text-white"
                          : "bg-black/5 text-black/60"
                      }`}
                    >
                      URL 입력
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsageVideoType("file")}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        usageVideoType === "file"
                          ? "bg-[#001A37] text-white"
                          : "bg-black/5 text-black/60"
                      }`}
                    >
                      파일 업로드
                    </button>
                  </div>

                  {usageVideoType === "url" ? (
                    <input
                      value={usageVideoUrl}
                      onChange={(e) => setUsageVideoUrl(e.target.value)}
                      placeholder="물품 사용 영상 URL을 입력해주세요"
                      className="w-full rounded-2xl border border-black/30 bg-white px-4 sm:px-5 py-3 sm:py-4 text-[16px] sm:text-[18px] text-black outline-none placeholder:text-black/30 focus:border-[#001A37]"
                    />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="flex min-h-[120px] w-full flex-col items-center justify-center rounded-2xl border border-black/30 bg-white px-4 py-6 text-center transition hover:bg-black/[0.02]"
                      >
                        <div className="text-black/35 text-[18px] sm:text-[20px]">
                          물품의 사용 영상을 업로드 해주세요
                        </div>
                        <div className="mt-3 text-[30px] leading-none">⊕</div>
                        {usageVideoFile && (
                          <div className="mt-3 text-sm font-medium text-black/70">
                            {usageVideoFile.name}
                          </div>
                        )}
                      </button>

                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoFileChange}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  disabled={!canSubmit || submitLoading}
                  onClick={handleSubmit}
                  className="w-full rounded-2xl bg-[#FF7A1A] px-5 py-4 sm:py-5 text-[20px] sm:text-[22px] font-extrabold text-white shadow-[0_8px_20px_rgba(255,122,26,0.35)] transition disabled:opacity-40"
                >
                  {submitLoading ? "등록 중..." : "✓ 신규 물품 등록하기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
