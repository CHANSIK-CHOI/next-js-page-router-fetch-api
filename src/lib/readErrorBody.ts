type ErrorBody = { error?: string; alertMsg?: string };

const readErrorBody = async (response: Response): Promise<ErrorBody & { rawText?: string }> => {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  if (process.env.NODE_ENV !== "production") {
    console.log("contentType : ", contentType);
    console.log("isJson : ", isJson);
  }

  const cloned = response.clone();
  try {
    if (!isJson) {
      throw new Error("Non-JSON response");
    }
    const json: ErrorBody = await cloned.json();
    return json ?? {};
  } catch {
    // 서버가 JSON이 아닌 방식으로 내려준 응답 본문 전체 문자열 : ex) res.status(500).send("Internal Server Error")
    try {
      const rawText = await response.text();
      return rawText ? { rawText } : {};
    } catch {
      return {};
    }
  }
};

export default readErrorBody;
