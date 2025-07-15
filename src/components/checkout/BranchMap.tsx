import React from "react";
import { useBranchMap } from "@/hooks/useBranchMap";
import { validateEnv } from "@/utils/appwrite";

interface Branch {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

interface BranchMapProps {
  selectedBranch: number;
  branches: Branch[];
}

const BranchMap: React.FC<BranchMapProps> = ({ selectedBranch, branches }) => {
  const { googleMapsApiKey } = validateEnv();
  useBranchMap(branches, selectedBranch, googleMapsApiKey);

  return (
    <div>
      <div className="pb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Branch Location</h2>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <div className="font-semibold text-lg text-gray-800 dark:text-gray-100">
          {branches.find((b) => b.id === selectedBranch)?.name}
        </div>
        <div className="text-base text-gray-700 dark:text-gray-300">
          {branches.find((b) => b.id === selectedBranch)?.address}
        </div>
      </div>
      <div
        id="branch-map"
        style={{
          width: "100%",
          height: "250px",
          borderRadius: "1rem",
          overflow: "hidden",
        }}
        className="border border-gray-200 dark:border-gray-700 shadow-md"
      />
    </div>
  );
};

export default BranchMap; 