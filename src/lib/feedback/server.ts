import type {
  ApprovedFeedback,
  FeedbackPrivateRow,
  FeedbackPublicBase,
  FeedbackPublicRow,
  RevisedPendingPreviewFeedback,
  SupabaseError,
} from "@/types";
import { getSupabaseServer } from "@/lib/supabase/server";
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
      isPreview: true,
    };
  });
};

export const getFeedbacksIdsApi = async (): Promise<FeedbackPublicBase["id"][]> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const { data, error }: { data: Pick<FeedbackPublicBase, "id">[] | null; error: SupabaseError } =
    await supabaseServer.from("feedbacks").select("id");

  if (error || !data) {
    throw new Error("Failed fetch getFeedbacksIdsApi");
  }

  return data.map((item) => item.id);
};

export const getDetailFeedbacksApi = async (
  id: FeedbackPublicBase["id"]
): Promise<FeedbackPublicRow | null> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const { data, error }: { data: FeedbackPublicRow | null; error: SupabaseError } =
    await supabaseServer
      .from("feedbacks")
      .select(APPROVED_PUBLIC_COLUMNS)
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw new Error("Failed fetch getDetailFeedbacksApi");
  }

  return data;
};

export const getEmailApi = async (id: FeedbackPublicBase["id"]): Promise<string | null> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const { data, error }: { data: { email: string } | null; error: SupabaseError } =
    await supabaseServer.from("feedbacks").select("email").eq("id", id).maybeSingle();
  if (error) {
    throw new Error("Failed fetch getEmailApi");
  }

  return data?.email ?? null;
};

export const getAdminAllFeedbacksApi = async (): Promise<FeedbackPrivateRow[] | null> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const { data, error }: { data: FeedbackPrivateRow[] | null; error: SupabaseError } =
    await supabaseServer.from("feedbacks").select("*").order("updated_at", { ascending: false });

  if (error) {
    throw new Error("Failed fetch getAdminAllFeedbacksApi");
  }

  return data;
};
