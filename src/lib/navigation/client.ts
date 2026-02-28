import type { NextRouter } from "next/router";

type NavigationMethod = "push" | "replace";

const checkNavigationCancelledError = (error: unknown) => {
  if (!error) return false;

  if (typeof error === "string") {
    return (
      error.includes("Abort fetching component") || error.includes("Loading initial props cancelled")
    );
  }

  if (typeof error === "object") {
    const routeError = error as { cancelled?: boolean; message?: string };
    if (routeError.cancelled) return true;

    if (typeof routeError.message === "string") {
      return (
        routeError.message.includes("Abort fetching component") ||
        routeError.message.includes("Loading initial props cancelled")
      );
    }
  }

  return false;
};

const navigateSafely = async (router: NextRouter, method: NavigationMethod, href: string) => {
  if (router.asPath === href) return true;

  try {
    return await router[method](href);
  } catch (error) {
    if (checkNavigationCancelledError(error)) return false;
    throw error;
  }
};

export const pushSafely = async (router: NextRouter, href: string) => {
  return navigateSafely(router, "push", href);
};

export const replaceSafely = async (router: NextRouter, href: string) => {
  return navigateSafely(router, "replace", href);
};
