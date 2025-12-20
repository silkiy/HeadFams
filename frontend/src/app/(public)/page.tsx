"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

interface JanjiPria {
  id: string;
  description: string;
}

interface GalleryImage {
  id: string;
  name: string;
  url: string;
  category: string;
}

export default function Home() {
  const [janjiList, setJanjiList] = useState<JanjiPria[]>([]);
  const [galleryList, setGalleryList] = useState<GalleryImage[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const janjiRes = await api.get("/janji-pria/approved");
        if (janjiRes.data.success) {
          setJanjiList(janjiRes.data.data);
        }
        
        const galleryRes = await api.get("/gallery/one-per-category");
        if (Array.isArray(galleryRes.data)) {
          setGalleryList(galleryRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch public data", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-muted/20">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
          Janji <span className="text-primary">Pria</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          A commitment to excellence, integrity, and the future. Explore our promises and moments.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="#janji">Our Promises</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/gallery">View Gallery</Link>
          </Button>
        </div>
      </section>

      {/* Janji Pria Section */}
      <section id="janji" className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Approved Promises</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {janjiList.length > 0 ? (
            janjiList.map((janji) => (
              <Card key={janji.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Quote className="h-8 w-8 text-primary/40 mb-2" />
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium leading-relaxed">
                    "{janji.description}"
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
             <div className="col-span-full text-center py-12 text-muted-foreground">
               No promises displayed yet.
             </div>
          )}
        </div>
      </section>

      {/* Featured Gallery Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Moments</h2>
            <Button variant="ghost" asChild>
              <Link href="/gallery" className="flex items-center">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {galleryList.length > 0 ? (
              galleryList.map((image) => (
                <Link href="/gallery" key={image.id} className="group relative aspect-video overflow-hidden rounded-lg">
                  <img 
                    src={image.url} 
                    alt={image.category} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <h3 className="text-white text-xl font-bold">{image.category}</h3>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No moments to show.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
