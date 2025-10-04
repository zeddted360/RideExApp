// components/AddItemSidebar.tsx
"use client";
import React from "react";
import {
  Utensils,
  Star,
  Flame,
  Percent,
} from "lucide-react";

interface AddItemSidebarProps {
  activeTab: "discount" | "menu-item" | "featured-item" | "popular-item";
  setActiveTab: (tab: "discount" | "menu-item" | "featured-item" | "popular-item") => void;
}

const AddItemSidebar = ({ activeTab, setActiveTab }: AddItemSidebarProps) => {
  const tabs = [
    { id: "menu-item", label: "Menu Item", icon: Utensils },
    { id: "featured-item", label: "Featured Item", icon: Star },
    { id: "popular-item", label: "Popular Item", icon: Flame },
    { id: "discount", label: "Discount", icon: Percent },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white dark:bg-gray-800 border-b lg:border-r border-gray-200 dark:border-gray-700 p-4 lg:p-6 fixed lg:sticky top-0 z-10 lg:z-auto">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 hidden lg:block">Add New</h2>
      <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 lg:space-y-2 pb-2 lg:pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as  | "discount" | "menu-item" | "featured-item" | "popular-item")}
              className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AddItemSidebar;