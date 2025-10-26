"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Search, Package, X, Plus } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { listAsyncExtras } from "@/state/extraSlice";
import Image from "next/image";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { IFetchedExtras } from "../../../types/types";
import { ScrollArea } from "../ui/scroll-area";

interface AddExtrasModalProps {
  onAddExtras: (selectedExtras: IFetchedExtras[]) => void;
  loading?: boolean;
}

const AddExtrasModal: React.FC<AddExtrasModalProps> = ({ onAddExtras, loading = false }) => {
  const { extras, loading: extrasLoading } = useSelector((state: RootState) => state.extra);
  const [open, setOpen] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<IFetchedExtras[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { userId: vendorId } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (vendorId) dispatch(listAsyncExtras(vendorId));
  }, [dispatch, vendorId]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const handleCheckboxChange = (extra: IFetchedExtras, checked: boolean) => {
    if (checked) {
      setSelectedExtras((prev) => [...prev, extra]);
    } else {
      setSelectedExtras((prev) => prev.filter((e) => e.$id !== extra.$id));
    }
  };

  const handleRemoveExtra = (extraId: string) => {
    setSelectedExtras((prev) => prev.filter((e) => e.$id !== extraId));
  };

  const handleSave = () => {
    onAddExtras(selectedExtras);
    setSelectedExtras([]);
    setOpen(false);
  };

  const handleCancel = () => {
    setSelectedExtras([]);
    setSearchQuery("");
    setOpen(false);
  };

  const filteredExtras = extras.filter((extra: IFetchedExtras) =>
    extra.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    extra.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPrice = selectedExtras.reduce((sum, extra) => sum + parseFloat(extra.price), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-4 h-11 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30">
          <Plus className="w-4 h-4 mr-2" />
          Add Extras
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl flex flex-col h-[90vh] max-h-[90vh] p-0 gap-0 sm:max-w-md">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">Select Extras</DialogTitle>
          <DialogDescription className="text-sm">
            Choose extras to add to this item. Selected extras will be added to the total price.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search extras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 px-6 py-4 min-h-0">
          <div className="space-y-3">
            {extrasLoading === "pending" ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
                <p className="text-sm text-gray-500">Loading extras...</p>
              </div>
            ) : filteredExtras.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {searchQuery ? "No extras found" : "No extras available"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Create extras in the Extras Management section first"}
                </p>
              </div>
            ) : (
              filteredExtras.map((extra: IFetchedExtras) => {
                const isSelected = selectedExtras.some((e) => e.$id === extra.$id);
                return (
                  <div
                    key={extra.$id}
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                      isSelected
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => handleCheckboxChange(extra, !isSelected)}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        id={`extra-${extra.$id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleCheckboxChange(extra, !!checked)}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {extra.image ? (
                          <Image
                            src={fileUrl(validateEnv().extrasBucketId, extra.image)}
                            fill
                            alt={extra.name}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={`extra-${extra.$id}`}
                          className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer block mb-1"
                        >
                          {extra.name}
                        </Label>
                        <p className="text-base font-bold text-orange-600 dark:text-orange-400 mb-1">
                          ₦{parseFloat(extra.price).toLocaleString()}
                        </p>
                        {extra.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {extra.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {selectedExtras.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0 max-h-[200px] overflow-y-auto">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selected ({selectedExtras.length})
                </span>
                <button
                  onClick={() => setSelectedExtras([])}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-medium"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedExtras.map((extra) => (
                  <div
                    key={extra.$id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full text-sm"
                  >
                    <span className="font-medium text-gray-900 dark:text-gray-100">{extra.name}</span>
                    <span className="text-orange-600 dark:text-orange-400">₦{parseFloat(extra.price).toLocaleString()}</span>
                    <button
                      onClick={() => handleRemoveExtra(extra.$id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Extras Cost:</span>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                ₦{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Button variant="outline" onClick={handleCancel} className="h-11">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedExtras.length === 0 || loading}
            className="h-11 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 min-w-[140px]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add ({selectedExtras.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddExtrasModal;