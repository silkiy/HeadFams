"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface GalleryImage {
  id: string;
  name: string;
  url: string;
  category: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchImages = async (category?: string) => {
    setLoading(true);
    try {
      const url = category && category !== "All" 
        ? `/gallery?limit=100&category=${encodeURIComponent(category)}`
        : "/gallery?limit=100";
      
      const response = await api.get(url);
      if (response.data.success) {
        setImages(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch gallery", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // We can use the one-per-category endpoint to get available categories efficiently
      // OR just fetch all and dedup (but that's slow for large sets).
      // Let's rely on the one-per-category for now as a "category list" source
      const response = await api.get("/gallery/one-per-category");
      if (Array.isArray(response.data)) {
        const uniqueCategories = Array.from(new Set(response.data.map((img: any) => img.category)));
        setCategories(["All", ...uniqueCategories as string[]]);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
      setCategories(["All"]); // Fallback
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchImages();
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchImages(category);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Gallery</h1>
      
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
         <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8" /></div>
      ) : images.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          No images found.
        </div>
      ) : (
        <div className="columns-1 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((image) => (
            <div key={image.id} className="break-inside-avoid">
              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                    <img 
                    src={image.url} 
                    alt={image.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    />
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-muted-foreground">{image.category}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
