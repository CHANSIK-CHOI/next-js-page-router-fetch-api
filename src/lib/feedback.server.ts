import type { ApprovedFeedback, RevisedPendingPreviewFeedback } from "@/types";
import { getSupabaseServer } from "@/lib/supabase.server";
import { APPROVED_PUBLIC_COLUMNS, PREVIEWCOLUMN } from "@/constants";

export const getApprovedFeedbacksApi = async (): Promise<ApprovedFeedback[]> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const { data, error } = await supabaseServer
    .from("feedbacks")
    .select(APPROVED_PUBLIC_COLUMNS)
    .eq("status", "approved")
    .eq("is_public", true)
    .order("created_at", {
      ascending: false,
    });

  if (error || !data) {
    throw new Error("Failed fetch getApprovedFeedbacksApi");
  }

  return data.map((item) => {
    return {
      ...item,
      email: "",
      isPreview: false,
    };
  });
};

export const getRevisedPendingPreviewApi = async (): Promise<RevisedPendingPreviewFeedback[]> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const { data, error } = await supabaseServer
    .from("feedbacks")
    .select(PREVIEWCOLUMN)
    .eq("status", "revised_pending")
    .eq("is_public", true)
    .order("created_at", {
      ascending: false,
    });

  if (error || !data) {
    throw new Error("Failed fetch getRevisedPendingPreviewApi");
  }

  return data.map((item) => {
    return {
      ...item,
      email: "",
      isPreview: true,
    };
  });
};
