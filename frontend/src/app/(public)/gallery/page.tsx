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

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await api.get("/gallery?limit=100");
        if (response.data.success) {
          setImages(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch gallery", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Gallery</h1>
      
      {images.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          No images found.
        </div>
      ) : (
        <div className="columns-1 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((image) => (
            <div key={image.id} className="break-inside-avoid">
              <Card className="overflow-hidden">
                <img 
                  src={image.url} 
                  alt={image.name} 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
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
