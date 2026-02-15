import type {
  ApprovedFeedback,
  FeedbackBase,
  FeedbackRow,
  RevisedPendingPreviewFeedback,
  SupabaseError,
} from "@/types";
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

export const getFeedbacksIdsApi = async (): Promise<FeedbackBase["id"][]> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const { data, error }: { data: Pick<FeedbackBase, "id">[] | null; error: SupabaseError } =
    await supabaseServer.from("feedbacks").select("id");

  if (error || !data) {
    throw new Error("Failed fetch getFeedbacksIdsApi");
  }

  return data.map((item) => item.id);
};

export const getDetailFeedbacksApi = async (
  id: FeedbackBase["id"]
): Promise<FeedbackRow | null> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const {
    data,
    error,
  }: { data: FeedbackRow | null; error: SupabaseError } = await supabaseServer
    .from("feedbacks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Failed fetch getDetailFeedbacksApi");
  }

  return data;
};
