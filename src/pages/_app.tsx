import GlobalLayout from "@/components/GlobalLayout";
import "@/styles/tailwind.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "@/components";
import { DialogProvider } from "@/components/ui";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <DialogProvider container={container}>
          <GlobalLayout>
            <Component {...pageProps} />
          </GlobalLayout>
          <div ref={setContainer} className="z-[9999]" />
        </DialogProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
