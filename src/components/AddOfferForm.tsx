// components/AddOfferForm.tsx (already client-side, minor tweaks for JSON handling)
'use client';
import { useState } from 'react';
import { useAuth } from '@/context/authContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ID } from 'appwrite';
import { databases, fileUrl, storage, validateEnv } from '@/utils/appwrite';
import toast from 'react-hot-toast';
import { Plus, Loader2 } from 'lucide-react';

interface AddOfferFormProps {
  onSuccess: () => void;
}

export default function AddOfferForm({ onSuccess }: AddOfferFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: 'Order Now',
    bgColor: 'from-orange-100 to-yellow-100',
    textColor: 'text-orange-600',
    decorativeElements: ['🍟', '🥤'], // Array of strings
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDecorativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const elements = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData({ ...formData, decorativeElements: elements.length > 0 ? elements : ['🍟', '🥤'] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.userId || user.role !== "admin") return;

    setLoading(true);
    try {
      let imageId = '';
      if (imageFile) {
        const file = new File([imageFile], imageFile.name, { type: imageFile.type });
        const uploadResponse = await storage.createFile(
          validateEnv().promoOfferBucketId,
          ID.unique(),
          file
        );
        imageId = uploadResponse.$id;
      }

      // Create document in DB
      const offerData = {
        ...formData,
        image: imageId,
        decorativeElements:formData.decorativeElements, 
        createdBy: user.userId,
      };

      await databases.createDocument(
        validateEnv().databaseId,
        validateEnv().promoOfferCollectionId,
        ID.unique(),
        offerData
      );

      toast.success('Offer created successfully!');
      // Reset form
      setFormData({
        title: '',
        subtitle: '',
        buttonText: 'Order Now',
        bgColor: 'from-orange-100 to-yellow-100',
        textColor: 'text-orange-600',
        decorativeElements: ['🍟', '🥤'],
      });
      setImageFile(null);
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      console.error('Failed to create offer:', err);
      toast.error('Failed to create offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-2 bg-orange-500 text-white hover:bg-orange-600"
      >
        <Plus className="w-4 h-4" />
        Add Offer
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Add New Offer</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Savory and Satisfying"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                required
                placeholder="e.g., Flat 5% off on Veg & Non-veg Burgers"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                name="buttonText"
                value={formData.buttonText}
                onChange={handleInputChange}
                placeholder="e.g., Order Now"
              />
            </div>
            <div>
              <Label htmlFor="image">Offer Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label htmlFor="bgColor">Background Color (Tailwind)</Label>
              <Input
                id="bgColor"
                name="bgColor"
                value={formData.bgColor}
                onChange={handleInputChange}
                placeholder="e.g., from-orange-100 to-yellow-100"
              />
            </div>
            <div>
              <Label htmlFor="textColor">Text Color (Tailwind)</Label>
              <Input
                id="textColor"
                name="textColor"
                value={formData.textColor}
                onChange={handleInputChange}
                placeholder="e.g., text-orange-600"
              />
            </div>
            <div>
              <Label>Decorative Elements (Emojis, comma-separated)</Label>
              <Input
                type="text"
                value={formData.decorativeElements.join(', ')}
                onChange={handleDecorativeChange}
                placeholder="e.g., 🍟, 🥤, 🍕"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Offer
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}