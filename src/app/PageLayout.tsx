'use client';

import React from "react";
import { useDisclosure } from "@heroui/react";
import { AuthModal } from "@/components/auth-modal";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import ScrapingLoader from "@/components/loaders/scraping-loader";
import { useAppStore } from "@/store";
import { usePathname } from "next/navigation";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isScraping } = useAppStore();
  const pathname = usePathname(); // ✅ Fix typo: use `pathname`, not `pathName`

  return (
    <>
      {pathname.includes("/admin") ? (
        children
      ) : (
        <div className="relative flex flex-col" id="app-container">
          <main className="flex flex-col relative">
            {isScraping && <ScrapingLoader />}
            <Navbar onOpen={onOpen} />
            <section className="h-full flex-1">{children}</section>
            <AuthModal
              isOpen={isOpen}
              onOpen={onOpen}
              onOpenChange={onOpenChange}
            />
            <Footer />
          </main>
        </div>
      )}
    </>
  );
};

export default PageLayout;
