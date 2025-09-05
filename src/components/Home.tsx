"use client";
import FeaturedItem from "@/components/FeaturedItem";
import Hero from "@/components/Hero";
import Menu from "@/components/Menu";
import PromotionalBanner from "@/components/PromotionalBanner";
import PopularItem from "@/components/PopularItem";
import { useState } from "react";
import { useAuth } from "@/context/authContext";
import MiniNavigation from "@/components/Hero";

export default function HomeClient() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);


  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6 pt-20">
        <MiniNavigation />
        <Menu />
        <FeaturedItem toggleFavorite={toggleFavorite} favorites={favorites} />
        <PopularItem toggleFavorite={toggleFavorite} favorites={favorites} />
        <PromotionalBanner />
      </div>
    </>
  );
}
