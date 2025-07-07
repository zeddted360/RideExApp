"use client"
import { ReactNode } from "react"
import { Toaster } from "react-hot-toast";
import { TranslationProvider } from "./TranslationProvider";
import { _ThemeProvider } from "./ThemeProvider";
import { StoreProvider } from "@/state/StoreProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import i18n from "@/app/lib/i18n";

export const Wrapper = ({ children }: { children: ReactNode }) => {
    
    return (
      <html lang={i18n.language} suppressHydrationWarning>
        <body className="min-h-screen flex flex-col">
          <Toaster position="top-right" />
          <TranslationProvider>
            <_ThemeProvider>
              <StoreProvider>
                <Header />
                <main className="flex-grow mt-20">{children}</main>
                <Footer />
              </StoreProvider>
            </_ThemeProvider>
          </TranslationProvider>
        </body>
      </html>
    );
}