import { useEffect, useMemo, useRef, useState } from "react";
import cancel from "../../assets/rental/cancel-white.svg";
import { getCategories } from "../../api/rental/rentalApi";
import {
  getItemDetail,
  updateItem,
  uploadItemImage,
} from "../../api/admin/adminApi";
import type { Category } from "../../api/rental/types";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";

type PreviewImage =
  | {
      kind: "existing";
      url: string;
    }
  | {
      kind: "new";
      file: File;
      previewUrl: string;
    };

type ItemDetailResponse = {
  id: number;
  category: {
    id: number;
    name: string;
  };
  name: string;
  itemCode?: string;
  description: string;
  rentalCount?: number;
  imageUrl: string | null;
  videoUrl: string | null;
  itemImages?: Array<{
    id: number;
    imageUrl: string;
    order: number;
  }>;
  managementType?: "BULK" | "INDIVIDUAL";
  totalQuantity: number;
  createdAt?: string;
};

type Props = {
  open: boolean;
  itemId: number | null;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
};

export default function AdminItemEditModal({
  open,
  itemId,
  onClose,
  onSuccess,
}: Props) {
  useLockBodyScroll(open);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [totalQuantity, setTotalQuantity] = useState("0");
  const [description, setDescription] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [managementType, setManagementType] = useState<"BULK" | "INDIVIDUAL">(
    "BULK",
  );

  const [usageVideoType, setUsageVideoType] = useState<"url" | "file">("url");
  const [usageVideoUrl, setUsageVideoUrl] = useState("");
  const [usageVideoFile, setUsageVideoFile] = useState<File | null>(null);

  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setCategoryId(null);
    setTotalQuantity("0");
    setDescription("");
    setItemCode("");
    setManagementType("BULK");
    setUsageVideoType("url");
    setUsageVideoUrl("");
    setUsageVideoFile(null);
    setPreviewImages([]);
    setCurrentImageIndex(0);
    setError(null);
    setDetailError(null);
    setSubmitLoading(false);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
      return;
    }

    let alive = true;

    async function loadInitialData() {
      if (!itemId) return;

      setCategoriesLoading(true);
      setCategoriesError(null);
      setDetailLoading(true);
      setDetailError(null);
      setError(null);

      try {
        const [categoryResult, itemDetail] = await Promise.all([
          getCategories(),
          getItemDetail(itemId),
        ]);

        if (!alive) return;

        const categoriesData = (categoryResult ?? []) as Category[];
        const detail = itemDetail as ItemDetailResponse;

        setCategories(categoriesData);
        setName(detail.name ?? "");
        setCategoryId(detail.category?.id ?? categoriesData?.[0]?.id ?? null);
        setTotalQuantity(String(detail.totalQuantity ?? 0));
        setDescription(detail.description ?? "");
        setItemCode(detail.itemCode ?? "");
        setManagementType(detail.managementType ?? "BULK");
        setUsageVideoUrl(detail.videoUrl ?? "");
        setUsageVideoType("url");
        setUsageVideoFile(null);

        const existingImages =
          detail.itemImages && detail.itemImages.length > 0
            ? [...detail.itemImages]
                .sort((a, b) => a.order - b.order)
                .map(
                  (img): PreviewImage => ({
                    kind: "existing",
                    url: img.imageUrl,
                  }),
                )
            : detail.imageUrl
              ? [{ kind: "existing", url: detail.imageUrl } as PreviewImage]
              : [];

        setPreviewImages(existingImages);
        setCurrentImageIndex(0);
      } catch (e) {
        if (!alive) return;
        const message =
          e instanceof Error ? e.message : "물품 정보를 불러오지 못했습니다.";
        setDetailError(message);
      } finally {
        if (!alive) return;
        setCategoriesLoading(false);
        setDetailLoading(false);
      }
    }

    loadInitialData();

    return () => {
      alive = false;
    };
  }, [open, itemId]);

  useEffect(() => {
    return () => {
      previewImages.forEach((img) => {
        if (img.kind === "new") {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [previewImages]);

  const parsedQuantity = useMemo(() => {
    const n = Number(totalQuantity);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.floor(n);
  }, [totalQuantity]);

  const canSubmit = useMemo(() => {
    if (!itemId) return false;
    if (!name.trim()) return false;
    if (!categoryId) return false;
    if (parsedQuantity < 0) return false;
    if (!description.trim()) return false;
    if (detailLoading) return false;
    return true;
  }, [itemId, name, categoryId, parsedQuantity, description, detailLoading]);

  const currentImageSrc = useMemo(() => {
    const current = previewImages[currentImageIndex];
    if (!current) return null;
    return current.kind === "existing" ? current.url : current.previewUrl;
  }, [previewImages, currentImageIndex]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const nextImages: PreviewImage[] = files.map((file) => ({
      kind: "new",
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPreviewImages((prev) => [...prev, ...nextImages]);

    if (e.target) {
      e.target.value = "";
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? previewImages.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === previewImages.length - 1 ? 0 : prev + 1,
    );
  };

  const handleRemoveCurrentImage = () => {
    if (!previewImages.length) return;

    const target = previewImages[currentImageIndex];
    if (target?.kind === "new") {
      URL.revokeObjectURL(target.previewUrl);
    }

    setPreviewImages((prev) =>
      prev.filter((_, idx) => idx !== currentImageIndex),
    );

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
    if (!itemId || submitLoading) return;
    setError(null);

    try {
      if (!name.trim()) throw new Error("물품 이름을 입력해주세요.");
      if (!categoryId) throw new Error("카테고리를 선택해주세요.");
      if (parsedQuantity < 0) throw new Error("총 보유 수량을 확인해주세요.");
      if (!description.trim()) throw new Error("상세 설명을 입력해주세요.");
      if (previewImages.length === 0)
        throw new Error("대표 이미지를 최소 1장 등록해주세요.");

      if (usageVideoType === "file" && usageVideoFile) {
        throw new Error(
          "영상 파일 업로드는 아직 지원되지 않습니다. URL을 입력해주세요.",
        );
      }

      setSubmitLoading(true);

      const existingUrls = previewImages
        .filter((img): img is Extract<PreviewImage, { kind: "existing" }> => {
          return img.kind === "existing";
        })
        .map((img) => img.url);

      const newFiles = previewImages.filter(
        (img): img is Extract<PreviewImage, { kind: "new" }> =>
          img.kind === "new",
      );

      const uploadedNewUrls = await Promise.all(
        newFiles.map((img) => uploadItemImage(img.file)),
      );

      const finalImageUrls = [...existingUrls, ...uploadedNewUrls];

      await updateItem(itemId, {
        categoryId,
        name: name.trim(),
        itemCode: itemCode.trim(),
        description: description.trim(),
        imageUrl: finalImageUrls[0] ?? null,
        imageUrls: finalImageUrls,
        videoUrl:
          usageVideoType === "url" ? usageVideoUrl.trim() || null : null,
        managementType,
        totalQuantity: parsedQuantity,
      });

      await onSuccess?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "물품 수정에 실패했습니다.");
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
        <div className="flex items-center justify-between bg-[#001A37] px-5 py-4 sm:px-8 sm:py-6">
          <div className="text-[24px] font-extrabold text-white sm:text-[clamp(28px,3vw,40px)]">
            물품 수정
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center sm:h-12 sm:w-12"
            aria-label="닫기"
          >
            <img
              src={cancel}
              alt="닫기"
              className="h-7 w-7 object-contain sm:h-9 sm:w-9"
            />
          </button>
        </div>

        <div className="max-h-[calc(90dvh-96px)] overflow-y-auto px-5 py-6 sm:px-10 sm:py-8">
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

          {detailError && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {detailError}
            </div>
          )}

          {detailLoading ? (
            <div className="rounded-2xl bg-white px-6 py-10 text-center text-base text-black/60">
              물품 정보를 불러오는 중...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div>
                <div className="mb-3 text-[18px] font-bold text-black sm:text-[22px]">
                  대표 이미지
                </div>

                <div className="rounded-[20px] bg-white p-3 sm:p-4">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="group relative flex h-[240px] w-full items-center justify-center overflow-hidden rounded-[20px] border-2 border-dashed border-black/20 bg-white text-center transition hover:bg-black/[0.02] sm:h-[280px] lg:h-[320px]"
                  >
                    {previewImages.length > 0 && currentImageSrc ? (
                      <>
                        <div className="flex h-full w-full items-center justify-center p-4 sm:p-6">
                          <img
                            src={currentImageSrc}
                            alt={`대표 이미지 ${currentImageIndex + 1}`}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        {previewImages.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrevImage();
                              }}
                              className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-black/45 text-lg text-white sm:left-3 sm:h-10 sm:w-10 sm:text-xl"
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
                              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-black/45 text-lg text-white sm:right-3 sm:h-10 sm:w-10 sm:text-xl"
                              aria-label="다음 이미지"
                            >
                              ›
                            </button>
                          </>
                        )}

                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs text-white sm:text-sm">
                          {currentImageIndex + 1} / {previewImages.length}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCurrentImage();
                          }}
                          className="absolute right-2 top-2 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white sm:text-sm"
                        >
                          삭제
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center px-4 text-black/35">
                        <div className="text-[44px] leading-none sm:text-[52px]">
                          ⊕
                        </div>
                        <div className="mt-3 text-[18px] font-semibold sm:text-[24px]">
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

                  {previewImages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {previewImages.map((img, idx) => (
                        <button
                          key={
                            img.kind === "existing"
                              ? `${img.url}-${idx}`
                              : `${img.file.name}-${idx}`
                          }
                          type="button"
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`rounded-full border px-3 py-1 text-xs transition sm:text-sm ${
                            idx === currentImageIndex
                              ? "border-[#001A37] bg-[#001A37] text-white"
                              : "border-black/15 bg-white text-black/70"
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
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[18px] font-bold text-black sm:text-[22px]">
                      물품 이름
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="예: 대형 천막"
                      className="w-full rounded-2xl border border-black/30 bg-white px-4 py-3 text-[16px] text-black outline-none placeholder:text-black/30 focus:border-[#001A37] sm:px-5 sm:py-4 sm:text-[18px]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[18px] font-bold text-black sm:text-[22px]">
                      카테고리
                    </label>
                    <select
                      value={categoryId ?? ""}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                      disabled={categoriesLoading}
                      className="w-full rounded-2xl border border-black/30 bg-white px-4 py-3 text-[16px] text-black outline-none focus:border-[#001A37] disabled:opacity-60 sm:px-5 sm:py-4 sm:text-[18px]"
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
                    <label className="mb-2 block text-[18px] font-bold text-black sm:text-[22px]">
                      총 보유 수량
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={totalQuantity}
                      onChange={(e) => setTotalQuantity(e.target.value)}
                      className="w-full rounded-2xl border border-black/30 bg-white px-4 py-3 text-[16px] text-black outline-none focus:border-[#001A37] sm:px-5 sm:py-4 sm:text-[18px]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[18px] font-bold text-black sm:text-[22px]">
                      상세 설명
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="물품에 대한 상세한 설명을 적어주세요"
                      rows={4}
                      className="w-full resize-none rounded-2xl border border-black/30 bg-white px-4 py-3 text-[16px] text-black outline-none placeholder:text-black/30 focus:border-[#001A37] sm:px-5 sm:py-4 sm:text-[18px]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[18px] font-bold text-black sm:text-[22px]">
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
                        className="w-full rounded-2xl border border-black/30 bg-white px-4 py-3 text-[16px] text-black outline-none placeholder:text-black/30 focus:border-[#001A37] sm:px-5 sm:py-4 sm:text-[18px]"
                      />
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="flex min-h-[120px] w-full flex-col items-center justify-center rounded-2xl border border-black/30 bg-white px-4 py-6 text-center transition hover:bg-black/[0.02]"
                        >
                          <div className="text-[18px] text-black/35 sm:text-[20px]">
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
                    className="w-full rounded-2xl bg-[#FF7A1A] px-5 py-4 text-[20px] font-extrabold text-white shadow-[0_8px_20px_rgba(255,122,26,0.35)] transition disabled:opacity-40 sm:py-5 sm:text-[22px]"
                  >
                    {submitLoading ? "수정 중..." : "✓ 물품 수정하기"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
