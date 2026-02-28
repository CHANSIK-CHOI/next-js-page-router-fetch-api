import type { User } from "@supabase/supabase-js";

export const getUserName = (user: User | undefined) => {
  const rawName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.user_name ||
    user?.email?.split("@")[0];
  const userName = rawName ? String(rawName) : "사용자";

  return userName;
};

export const getUserCompany = (user: User | undefined) => {
  const companyName = user?.user_metadata.company_name;
  const sessionCompanyName = companyName ? companyName : "";
  const isCompanyPublic = user?.user_metadata.is_company_public;
  const sessionIsCompanyPublic = Boolean(isCompanyPublic) ? isCompanyPublic : false;
  return { sessionCompanyName, sessionIsCompanyPublic };
};
