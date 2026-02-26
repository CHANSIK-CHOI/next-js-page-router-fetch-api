import type {
  AdminReviewFeedback,
  ApprovedFeedback,
  RevisedPendingPreviewFeedback,
  RevisedPendingOwnerFeedback,
  FeedbackListItem,
} from "@/types";
import { PLACEHOLDER_SRC } from "@/constants";
import { User } from "@supabase/supabase-js";

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

export const isPrivateAvatarApiSrc = (src: string) => {
  try {
    const parsedUrl = new URL(src, "http://localhost");
    return parsedUrl.pathname.startsWith("/api/avatar/");
  } catch {
    return src.startsWith("/api/avatar/");
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

export const getUserName = (user: User | undefined) => {
  const rawName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.user_name ||
    user?.email?.split("@")[0];
  const userName = rawName ? String(rawName) : "사용자";

  return userName;
};

export const getAvatarUrl = (user: User | undefined) => {
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.user_metadata?.avatar;

  return avatarUrl;
};

export const getAvatarImageSrc = (avatarUrl: string | null | undefined) => {
  return normalizeExternalImageSrc(avatarUrl || PLACEHOLDER_SRC);
};

export const buildAvatarDirectory = (userId: string) => `users/${userId}`;
export const buildAvatarPath = (userId: string) => `${buildAvatarDirectory(userId)}/avatar`;
export const buildAvatarProxyUrl = (userId: string) =>
  `/api/avatar/${encodeURIComponent(userId)}?t=${Date.now()}`;

export const getUserCompany = (user: User | undefined) => {
  const companyName = user?.user_metadata.company_name;
  const sessionCompanyName = companyName ? companyName : "";
  const isCompanyPublic = user?.user_metadata.is_company_public;
  const sessionIsCompanyPublic = Boolean(isCompanyPublic) ? isCompanyPublic : false;
  return { sessionCompanyName, sessionIsCompanyPublic };
};

export const getAuthProviders = (user: User | null | undefined) => {
  // identities : 현재 유저의 로그인 계정 연결 목록
  const identityProviders = (user?.identities ?? [])
    .map((identity) => identity.provider)
    .filter((provider): provider is string => typeof provider === "string");

  const metadataProviders = Array.isArray(user?.app_metadata?.providers)
    ? user.app_metadata.providers.filter(
        (provider): provider is string => typeof provider === "string"
      )
    : [];

  const primaryProvider =
    typeof user?.app_metadata?.provider === "string" ? [user.app_metadata.provider] : [];

  return Array.from(new Set([...identityProviders, ...metadataProviders, ...primaryProvider]));
  // 스프레드로 합치고
  // new Set : 중복을 제거하는 역할
  // Array.from : Set을 다시 배열로 바꾸는 역할
};
