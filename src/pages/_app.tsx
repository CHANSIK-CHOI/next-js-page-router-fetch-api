import GlobalLayout from "@/components/GlobalLayout";
import "@/styles/tailwind.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <GlobalLayout>
        <Component {...pageProps} />
      </GlobalLayout>
    </ThemeProvider>
  );
}
