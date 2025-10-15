"use client";
import FeaturedItem from "@/components/FeaturedItem";
import Menu from "@/components/Menu";
import PromotionalBanner from "@/components/PromotionalBanner";
import PopularItem from "@/components/PopularItem";
import { useState } from "react";
import MiniNavigation from "@/components/Hero";
import DiscountsList from "./DiscountList";

export default function HomeClient() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());


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
        <FeaturedItem toggleFavorite={toggleFavorite} favorites={favorites}/>
        <PromotionalBanner />
        <PopularItem toggleFavorite={toggleFavorite} favorites={favorites}/>
        <DiscountsList/>
      </div>
    </>
  );
}
