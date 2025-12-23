"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HandHeart, Image as ImageIcon, Users } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

interface DashboardStats {
  totalJanji: number;
  totalGallery: number;
  totalProfile: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJanji: 0,
    totalGallery: 0,
    totalProfile: 0,
  });

  useEffect(() => {
    // Ideally fetch stats from an API endpoint like /dashboard/stats
    // For now, we can fetch list counts or mock it.
    // Let's mock for this step or fetch separate lists if easy.
    const fetchStats = async () => {
      try {
        const janjiRes = await api.get("/janji-pria"); // Just getting approved count for now
        const galleryRes = await api.get("/gallery");
        const profileRes = await api.get("/profile");

        setStats({
          totalJanji: janjiRes.data.total || 0,
          totalGallery: galleryRes.data.totalCount || 0,
          totalProfile: profileRes.data.totalCount || 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/janji-pria"><Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Janji Pria</CardTitle>
            <HandHeart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJanji}</div>
            <p className="text-xs text-muted-foreground">
              Approved promises
            </p>
          </CardContent>
        </Card>
        </Link>
        <Link href="/admin/gallery">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gallery Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGallery}</div>
            <p className="text-xs text-muted-foreground">
              Uploaded photos
            </p>
          </CardContent>
        </Card>
        </Link>
        <Link href="/admin/profile">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profile</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProfile}</div>
            <p className="text-xs text-muted-foreground">
              Total profiles
            </p>
          </CardContent>
        </Card>
        </Link>
        {/* Placeholder for future features */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Admin account
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
