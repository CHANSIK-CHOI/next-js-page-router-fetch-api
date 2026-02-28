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
