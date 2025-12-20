"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GalleryImage {
  id: string;
  name: string;
  url: string;
  category: string;
  uploadedAt: any;
}

export default function GalleryManagementPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const fetchImages = async () => {
    try {
      const response = await api.get("/gallery?limit=50");
      if (response.data.success) {
        setImages(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch gallery", error);
      toast.error("Error", {
        description: "Failed to load images",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !categoryName) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("categoryName", categoryName);

    try {
      await api.post("/gallery", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Success", {
        description: "Image uploaded successfully",
      });
      setIsOpen(false);
      setSelectedFile(null);
      setCategoryName("");
      fetchImages();
    } catch (error: any) {
      console.error("Upload failed", error);
      toast.error("Upload Failed", {
        description: error.response?.data?.detail || error.response?.data?.error || "Failed to upload image",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    try {
      await api.delete(`/gallery/delete/${id}`);
      toast.success("Success", {
        description: "Image deleted",
      });
      fetchImages();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Error", {
        description: "Failed to delete image",
      });
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gallery Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Image</DialogTitle>
              <DialogDescription>
                Upload a new image to the gallery.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category Name</Label>
                <Input 
                  id="category" 
                  value={categoryName} 
                  onChange={(e) => setCategoryName(e.target.value)} 
                  placeholder="e.g. Wedding, Event" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image File</Label>
                <Input 
                  id="image" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isUploading}>
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden group relative">
            <div className="aspect-square relative">
              {/* Note: In production we should use Next.js Image component, but valid domains need config. 
                  We fetch from Google Drive links provided by backend. 
                  If backend returns a webViewLink, user needs permission? 
                  Likely backend returns a public link or proxy.
                  Assuming 'url' is accessible. */}
              <img 
                src={image.url} 
                alt={image.name} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="destructive" size="icon" onClick={() => handleDelete(image.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="font-medium text-sm truncate">{image.category}</p>
              <p className="text-xs text-muted-foreground truncate">{image.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
