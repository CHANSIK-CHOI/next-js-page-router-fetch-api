import type {
  ApprovedFeedback,
  FeedbackPrivateRow,
  FeedbackPublicBase,
  FeedbackPublicRow,
  RevisedPendingPreviewFeedback,
  SupabaseError,
} from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";
import { APPROVED_PUBLIC_COLUMNS, PREVIEWCOLUMN } from "@/constants";

type FeedbackStatus = FeedbackPublicRow["status"];
type GetFeedbackRowsByStatusesParams = {
  supabaseClient: SupabaseClient;
  statuses: FeedbackStatus[];
};

const getRequiredSupabaseServer = () => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return supabaseServer;
};

export const getPublicApprovedFeedbacksByStatuses = async (
  statuses: Array<"approved">
): Promise<ApprovedFeedback[]> => {
  const supabaseServer = getRequiredSupabaseServer();

  const { data, error } = await supabaseServer
    .from("feedbacks")
    .select(APPROVED_PUBLIC_COLUMNS)
    .in("status", statuses)
    .eq("is_public", true)
    .order("updated_at", {
      ascending: false,
    });

  if (error || !data) {
    throw new Error("Failed fetch getPublicApprovedFeedbacksByStatuses");
  }

  return data.map((item) => {
    return {
      ...item,
      isPreview: false,
    };
  });
};

export const getFeedbackRowsByStatuses = async ({
  supabaseClient,
  statuses,
}: GetFeedbackRowsByStatusesParams): Promise<FeedbackPrivateRow[]> => {
  const { data, error }: { data: FeedbackPrivateRow[] | null; error: SupabaseError } =
    await supabaseClient
      .from("feedbacks")
      .select("*")
      .in("status", statuses)
      .order("updated_at", { ascending: false });

  if (error || !data) {
    throw new Error("Failed fetch getFeedbackRowsByStatuses");
  }

  return data;
};

export const getApprovedFeedbacks = async (): Promise<ApprovedFeedback[]> => {
  return getPublicApprovedFeedbacksByStatuses(["approved"]);
};

export const getRevisedPendingPreviewFeedbacks = async (): Promise<
  RevisedPendingPreviewFeedback[]
> => {
  const supabaseServer = getRequiredSupabaseServer();

  const { data, error } = await supabaseServer
    .from("feedbacks")
    .select(PREVIEWCOLUMN)
    .eq("status", "revised_pending")
    .eq("is_public", true)
    .order("created_at", {
      ascending: false,
    });

  if (error || !data) {
    throw new Error("Failed fetch getRevisedPendingPreviewFeedbacks");
  }

  return data.map((item) => {
    return {
      ...item,
      isPreview: true,
    };
  });
};

export const getFeedbackIds = async (): Promise<FeedbackPublicBase["id"][]> => {
  const supabaseServer = getRequiredSupabaseServer();

  const { data, error }: { data: Pick<FeedbackPublicBase, "id">[] | null; error: SupabaseError } =
    await supabaseServer.from("feedbacks").select("id");

  if (error || !data) {
    throw new Error("Failed fetch getFeedbackIds");
  }

  return data.map((item) => item.id);
};

export const getFeedbackDetailById = async (
  id: FeedbackPublicBase["id"]
): Promise<FeedbackPublicRow | null> => {
  const supabaseServer = getRequiredSupabaseServer();

  const { data, error }: { data: FeedbackPublicRow | null; error: SupabaseError } =
    await supabaseServer
      .from("feedbacks")
      .select(APPROVED_PUBLIC_COLUMNS)
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw new Error("Failed fetch getFeedbackDetailById");
  }

  return data;
};

export const getFeedbackEmailById = async (
  id: FeedbackPublicBase["id"]
): Promise<string | null> => {
  const supabaseServer = getRequiredSupabaseServer();

  const { data, error }: { data: { email: string } | null; error: SupabaseError } =
    await supabaseServer.from("feedbacks").select("email").eq("id", id).maybeSingle();
  if (error) {
    throw new Error("Failed fetch getFeedbackEmailById");
  }

  return data?.email ?? null;
};

export const getAllFeedbackRows = async (): Promise<FeedbackPrivateRow[]> => {
  const supabaseServer = getRequiredSupabaseServer();
  return getFeedbackRowsByStatuses({
    supabaseClient: supabaseServer,
    statuses: ["pending", "approved", "rejected", "revised_pending"],
  });
};
