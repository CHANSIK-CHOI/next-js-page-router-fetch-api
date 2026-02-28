export const getAccessToken = (authHeader: string | undefined) => {
  return typeof authHeader === "string" && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
};
