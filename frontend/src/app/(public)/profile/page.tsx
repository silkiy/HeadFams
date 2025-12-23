"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Instagram, Loader2, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ProfileData {
    name: string;
    bio: string;
    instagram: string;
    photoUrl: string;
}

export default function PublicProfilePage() {
    const [data, setData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/profile");
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
                toast.error("Error", {
                    description: "Failed to load profile data.",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!data || (!data.name && !data.bio)) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-16">
                <div className="text-center space-y-4">
                    <h2 className="text-xl font-semibold">Profile Not Set Up</h2>
                    <p className="text-muted-foreground">The profile information has not been added yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-muted/30">
            <div className="container mx-auto max-w-2xl">
                <Card className="overflow-hidden border-none shadow-lg">
                    <div className="h-32 md:h-48 bg-gradient-to-r from-primary/10 via-primary/5 to-background"></div>
                    <CardContent className="relative px-6 pb-8">
                        <div className="absolute -top-16 md:-top-24 left-6 border-4 border-background rounded-full overflow-hidden shadow-md">
                            <Avatar className="h-32 w-32 md:h-48 md:w-48">
                                <AvatarImage src={data.photoUrl} alt={data.name} className="object-cover" />
                                <AvatarFallback className="text-4xl bg-muted"><User className="h-16 w-16 md:h-24 md:w-24 text-muted-foreground" /></AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="pt-20 md:pt-28 space-y-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">{data.name}</h1>
                                {data.instagram && (
                                    <Link
                                        href={`https://instagram.com/${data.instagram.replace('@', '')}`}
                                        target="_blank"
                                        className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mt-1"
                                    >
                                        <Instagram className="h-4 w-4 mr-1" />
                                        <span>@{data.instagram.replace('@', '')}</span>
                                    </Link>
                                )}
                            </div>

                            {data.bio && (
                                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
                                    {data.bio}
                                </div>
                            )}

                            {data.instagram && (
                                <div className="pt-4">
                                    <Button asChild variant="outline" className="gap-2 rounded-full">
                                        <Link href={`https://instagram.com/${data.instagram.replace('@', '')}`} target="_blank">
                                            <Instagram className="h-4 w-4" />
                                            Follow on Instagram
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
