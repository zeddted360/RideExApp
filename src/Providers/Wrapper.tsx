"use client"
import { ReactNode } from "react"
import { Toaster } from "react-hot-toast";
import { TranslationProvider } from "./TranslationProvider";
import { _ThemeProvider } from "./ThemeProvider";
import { StoreProvider } from "@/state/StoreProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import i18n from "@/app/lib/i18n";
import { ShowCartProvider } from "./ShowCartProvider";

export const Wrapper = ({ children }: { children: ReactNode }) => {
    
    return (
      <html suppressHydrationWarning={true}>
        <body className="min-h-screen flex flex-col">
          <Toaster position="top-right" />
          {/* <_ThemeProvider> */}
          <ShowCartProvider>
            <StoreProvider>
              <Header />
              <main className="flex-grow mt-20">{children}</main>
              <Footer />
            </StoreProvider>
          </ShowCartProvider>
          {/* </_ThemeProvider> */}
        </body>
      </html>
    );
}