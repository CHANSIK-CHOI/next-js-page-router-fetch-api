import type { User } from "@supabase/supabase-js";

export const getAuthProviders = (user: User | null | undefined) => {
  const identityProviders = (user?.identities ?? [])
    .map((identity) => identity.provider)
    .filter((provider): provider is string => typeof provider === "string");

  const metadataProviders = Array.isArray(user?.app_metadata?.providers)
    ? user.app_metadata.providers.filter(
        (provider): provider is string => typeof provider === "string"
      )
    : [];

  const primaryProvider =
    typeof user?.app_metadata?.provider === "string" ? [user.app_metadata.provider] : [];

  return Array.from(new Set([...identityProviders, ...metadataProviders, ...primaryProvider]));
};

export const getAuthProviderLabel = (provider: string) => {
  if (provider === "github") return "GitHub";
  if (provider === "email") return "이메일";
  return provider;
};
