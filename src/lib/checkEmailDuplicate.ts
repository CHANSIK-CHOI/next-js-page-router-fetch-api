import readErrorBody from "@/lib/readErrorBody";

export async function checkEmailDuplicate(email: string) {
  const response = await fetch("/api/check-email-duplicate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const { error, alertMsg, rawText } = await readErrorBody(response);
    if (error) console.error(error);
    const message = alertMsg ?? error ?? rawText ?? "이메일 중복 확인에 실패했습니다.";
    throw new Error(message);
  }

  const result = (await response.json()) as { exists: boolean };
  return result;
}
