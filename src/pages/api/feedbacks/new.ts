import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuthContext } from "@/lib/auth/request";
import type { FeedbackNewFormValues } from "@/types";
import { newFeedbackErrorMsg } from "@/pages/feedback/new";

type CreateFeedbackResponse = {
  data: { id: string } | null;
  error: string | null;
};

const toTrimmedString = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const toNullableTrimmedString = (value: unknown) => {
  const normalized = toTrimmedString(value);
  return normalized.length > 0 ? normalized : null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateFeedbackResponse>
) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ data: null, error: "Method Not Allowed" });
  }

  try {
    const auth = await getRequestAuthContext(req, {
      missingAccessTokenError: "로그인이 필요합니다.",
      unauthorizedError: "로그인 상태를 확인해주세요.",
    });
    if (auth.error || !auth.context) {
      return res.status(auth.status).json({ data: null, error: auth.error ?? "Unauthorized" });
    }

    const body: Partial<FeedbackNewFormValues> = req.body ?? {};
    const rating = Number(body.rating);
    const is_company_public = Boolean(body.is_company_public);
    const display_name = toTrimmedString(body.display_name);
    const summary = toTrimmedString(body.summary);
    const company_name = toNullableTrimmedString(body.company_name);
    const avatar_url = toNullableTrimmedString(body.avatar);
    const strengths = toNullableTrimmedString(body.strengths);
    const questions = toNullableTrimmedString(body.questions);
    const suggestions = toNullableTrimmedString(body.suggestions);
    const tagsArray = body.tags;
    const tags = Array.isArray(tagsArray)
      ? Array.from(
          new Set(
            tagsArray
              .filter((tag): tag is string => typeof tag === "string")
              .map((tag) => tag.trim())
              .filter(Boolean)
          )
        )
      : [];

    if (!display_name || !summary) {
      return res.status(400).json({ data: null, error: newFeedbackErrorMsg.nameSummary });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ data: null, error: newFeedbackErrorMsg.rating });
    }

    if (tags.length === 0) {
      return res.status(400).json({ data: null, error: newFeedbackErrorMsg.tag });
    }

    if (is_company_public && !company_name) {
      return res.status(400).json({ data: null, error: newFeedbackErrorMsg.company });
    }

    const email = auth.context.authData.user?.email;
    if (!email) {
      return res.status(400).json({ data: null, error: newFeedbackErrorMsg.email });
    }

    const { data, error } = await auth.context.supabaseServer
      .from("feedbacks")
      .insert({
        author_id: auth.context.userId,
        display_name,
        company_name,
        is_company_public,
        avatar_url,
        email,
        summary,
        strengths,
        questions,
        suggestions,
        rating,
        tags,
        status: "pending",
        is_public: false,
        revision_count: 0,
        reviewed_at: null,
        reviewed_by: null,
      })
      .select("id")
      .single();

    if (error || !data) {
      return res.status(500).json({ data: null, error: error?.message ?? "Insert failed" });
    }

    return res.status(201).json({ data, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ data: null, error: message });
  }
}
