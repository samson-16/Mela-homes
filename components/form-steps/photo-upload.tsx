"use client";

import type React from "react";
import { useState } from "react";
import { Upload, X } from "lucide-react";

interface PhotoUploadFormProps {
  formData: {
    photos: string[];
  };
  updateFormData: (updates: { photos: string[] }) => void;
}

export default function PhotoUploadForm({
  formData,
  updateFormData,
}: PhotoUploadFormProps) {
  const [previews, setPreviews] = useState<string[]>(formData.photos || []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPreviews: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await readFileAsBase64(file);
        newPreviews.push(base64);
      }

      const updatedPreviews = [...previews, ...newPreviews];
      setPreviews(updatedPreviews);
      updateFormData({ photos: updatedPreviews });
    }
    e.target.value = "";
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    updateFormData({ photos: updatedPreviews });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Upload Photos</h2>
        <p className="text-sm text-muted-foreground">
          Optional - Add multiple photos of your property
        </p>
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors relative">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div>
          <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-foreground font-medium">Click to upload photos</p>
          <p className="text-sm text-muted-foreground">
            JPG, PNG or GIF - Select multiple files
          </p>
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-muted p-4 rounded-lg">
        <p className="font-medium text-sm text-foreground mb-2">
          Tips for better engagement:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Add clear images of the kitchen and living room</li>
          <li>• Properties with 5+ photos get 70% more inquiries</li>
          <li>• Use well-lit, high-quality images</li>
          <li>• Show different angles of the property</li>
        </ul>
      </div>
    </div>
  );
}
