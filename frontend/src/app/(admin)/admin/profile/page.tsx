"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Save, Upload, User } from "lucide-react";

interface ProfileData {
    name: string;
    bio: string;
    instagram: string;
    photoUrl: string;
}

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<ProfileData>({
        name: "",
        bio: "",
        instagram: "",
        photoUrl: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get("/profile");
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
            toast.error("Error", {
                description: "Gagal mengambil data profil.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("bio", data.bio);
            formData.append("instagram", data.instagram);
            if (selectedFile) {
                formData.append("photo", selectedFile);
            }

            const response = await api.put("/profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                toast.success("Berhasil", {
                    description: "Profil berhasil diperbarui!",
                });
                // Update local data with response to ensure consistency
                setData(response.data.data);
                // Clear file selection
                setSelectedFile(null);
                setPreviewUrl("");
            }
        } catch (error: any) {
            console.error("Update failed", error);
            toast.error("Gagal", {
                description: error.response?.data?.error || "Gagal memperbarui profil.",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto p-4 md:p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
                <p className="text-muted-foreground">
                    Kelola informasi profil utama, termasuk foto, nama, bio, dan instagram.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Profil</CardTitle>
                    <CardDescription>
                        Perbarui informasi profil yang akan ditampilkan.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Photo Upload Section */}
                        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
                            <Avatar className="h-24 w-24 border-2 border-border cursor-pointer">
                                <AvatarImage src={previewUrl || data.photoUrl} alt="Profile" className="object-cover" />
                                <AvatarFallback className="bg-muted"><User className="h-10 w-10 text-muted-foreground" /></AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="photo" className="font-medium">Foto Profil</Label>
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="outline" size="sm" className="relative overflow-hidden">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Pilih Foto
                                        <input
                                            id="photo"
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                    {selectedFile && (
                                        <span className="text-xs text-muted-foreground max-w-[150px] truncate">
                                            {selectedFile.name}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Format: JPG, PNG, GIF. Max 5MB.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input
                                    id="name"
                                    placeholder="Nama Lengkap"
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Ceritakan sedikit tentang profil ini..."
                                    className="min-h-[100px]"
                                    value={data.bio}
                                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="instagram">Username Instagram</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">@</span>
                                    <Input
                                        id="instagram"
                                        placeholder="username"
                                        className="pl-8"
                                        value={data.instagram}
                                        onChange={(e) => setData({ ...data, instagram: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Simpan Perubahan
                                    </>
                                )}
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
