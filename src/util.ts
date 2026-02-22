import type {
  AdminReviewFeedback,
  ApprovedFeedback,
  RevisedPendingPreviewFeedback,
  RevisedPendingOwnerFeedback,
  FeedbackListItem,
} from "@/types";

export const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, digits.length - 4)}-${digits.slice(-4)}`;
};

export const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}년 ${month}월 ${day}일 ${hour}:${minute}`;
};

export const getAccessToken = (authHeader: string | undefined) => {
  return typeof authHeader === "string" && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
};

export const statusBadge = (status: string) => {
  if (status === "approved") {
    return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300";
  }
  if (status === "revised_pending") {
    return "bg-amber-500/15 text-amber-600 dark:text-amber-300";
  }
  if (status === "rejected") {
    return "bg-rose-500/15 text-rose-600 dark:text-rose-300";
  }
  return "bg-slate-500/15 text-slate-600 dark:text-slate-300";
};

export const statusLabel = (status: string) => {
  if (status === "approved") return "승인됨";
  if (status === "revised_pending") return "승인 대기(수정됨)";
  if (status === "rejected") return "반려됨";
  return "승인 대기";
};

export const ratingStars = (rating: number) => {
  return "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(rating);
};

const FILE_EXTENSION_PATTERN = /\.[a-z0-9]+$/i;

export const normalizeExternalImageSrc = (src: string) => {
  try {
    const parsedUrl = new URL(src);

    const isPlaceholdImage = parsedUrl.hostname === "placehold.co";
    if (!isPlaceholdImage) return src;

    const hasFileExtension = FILE_EXTENSION_PATTERN.test(parsedUrl.pathname);
    if (hasFileExtension) return src;

    // placehold.co URL without extension can fail in some rendering paths.
    parsedUrl.pathname = `${parsedUrl.pathname}.png`;
    return parsedUrl.toString();
  } catch {
    // If src is not a valid URL, leave it as-is.
    return src;
  }
};

export const isSvgImageSrc = (src: string) => {
  try {
    return new URL(src).pathname.toLowerCase().endsWith(".svg");
  } catch {
    return src.toLowerCase().split("?")[0].endsWith(".svg");
  }
};

type WithUpdatedAt = { updated_at?: string | null };

export const compareUpdatedAtDesc = (a: WithUpdatedAt, b: WithUpdatedAt) => {
  if (!a.updated_at || !b.updated_at) {
    console.error("compareUpdatedAtDesc: missing updated_at", { a, b });
    return 0;
  }

  const aTime = new Date(a.updated_at).getTime();
  const bTime = new Date(b.updated_at).getTime();

  if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
    console.error("compareUpdatedAtDesc: invalid updated_at", { a, b });
    return 0;
  }

  return bTime - aTime;
};

export const mergeFeedbackList = ({
  approved,
  revisedPreview,
  revisedMine,
  adminReview,
}: {
  approved: ApprovedFeedback[];
  revisedPreview: RevisedPendingPreviewFeedback[];
  revisedMine: RevisedPendingOwnerFeedback[];
  adminReview: AdminReviewFeedback[];
}): FeedbackListItem[] => {
  const mergedById = new Map<string, FeedbackListItem>();

  [...approved, ...revisedPreview].forEach((publicItem) => {
    mergedById.set(publicItem.id, publicItem);
  });

  if (adminReview.length === 0) {
    revisedMine.forEach((ownerItem) => {
      // 같은 id가 있으면 preview를 owner full 데이터로 덮어쓴다.
      mergedById.set(ownerItem.id, ownerItem);
    });
  } else {
    adminReview.forEach((adminItem) => {
      // 같은 id가 있으면 preview를 owner full 데이터로 덮어쓴다.
      mergedById.set(adminItem.id, adminItem);
    });
  }

  return Array.from(mergedById.values()).sort(compareUpdatedAtDesc);
};
