"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Instagram, Loader2, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ProfileData {
    id: string;
    name: string;
    bio: string;
    instagram: string;
    photoUrl: string;
}

export default function PublicProfilePage() {
    const [profiles, setProfiles] = useState<ProfileData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const response = await api.get("/profile");
                if (response.data.success) {
                    setProfiles(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch profiles", error);
                toast.error("Error", {
                    description: "Failed to load profile data.",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProfiles();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-muted/30">
            <div className="container mx-auto">
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">Meet The Team</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        The people behind the promises. Get to know our dedicated members.
                    </p>
                </div>

                {profiles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {profiles.map((profile) => (
                            <Card key={profile.id} className="overflow-hidden border-none shadow-none bg-transparent group">
                                <div className="aspect-[4/5] relative overflow-hidden bg-muted rounded-lg">
                                    <img
                                        src={profile.photoUrl}
                                        alt={profile.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                        <h3 className="text-white text-xl font-bold mb-1 translate-y-0 duration-300 text-shadow-sm shadow-black">{profile.name}</h3>
                                        {profile.instagram && (
                                            <Link
                                                href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                                                target="_blank"
                                                className="text-white/80 text-sm hover:text-white flex items-center gap-1 mb-2"
                                            >
                                                <Instagram className="h-3 w-3" />
                                                @{profile.instagram.replace('@', '')}
                                            </Link>
                                        )}
                                        <p className="text-white/70 text-sm line-clamp-3">
                                            {profile.bio}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card rounded-lg border border-dashed">
                        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-muted-foreground">No profiles yet</h3>
                        <p className="text-sm text-muted-foreground/60">Check back later to see our team.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
