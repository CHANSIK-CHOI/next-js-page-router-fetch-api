import type { User } from "@supabase/supabase-js";
import { AVATAR_PLACEHOLDER_SRC } from "@/lib/avatar/constants";

export const getAvatarUrl = (user: User | undefined) => {
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.avatar ||
    AVATAR_PLACEHOLDER_SRC;

  return avatarUrl;
};
