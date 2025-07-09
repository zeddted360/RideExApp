//Home page
"use client";
import FeaturedItem from "@/components/FeaturedItem";
import Hero from "@/components/Hero";
import Menu from "@/components/Menu";
import { useState } from "react";
import PromotionalBanner from "./PromotionalBanner";
import AddToCartModal from "./ui/AddToCartModal";

export default function HomeClient() {
  const [favorites, setFavorites] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);

 
  const toggleFavorite = (id: any) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

 

  return (
    <>
      <AddToCartModal/>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Hero setIsMobile={setIsMobile} isMobile={isMobile} />
        <Menu />
        <FeaturedItem toggleFavorite={toggleFavorite} favorites={favorites} />
        <PromotionalBanner />
      </div>
    </>
  );
}
