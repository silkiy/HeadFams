"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Loader2,
    Save,
    Upload,
    User,
    Plus,
    Pencil,
    Trash2,
    Instagram
} from "lucide-react";

interface ProfileData {
    id: string;
    name: string;
    bio: string;
    instagram: string;
    photoUrl: string;
}

export default function ProfilePage() {
    const [profiles, setProfiles] = useState<ProfileData[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog State
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        instagram: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const response = await api.get("/profile");
            if (response.data.success) {
                setProfiles(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch profiles", error);
            toast.error("Error", {
                description: "Gagal mengambil data profil.",
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: "", bio: "", instagram: "" });
        setSelectedFile(null);
        setPreviewUrl("");
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsOpen(true);
    };

    const handleOpenEdit = (profile: ProfileData) => {
        setFormData({
            name: profile.name,
            bio: profile.bio || "",
            instagram: profile.instagram || "",
        });
        setPreviewUrl(profile.photoUrl);
        setCurrentId(profile.id);
        setIsEditing(true);
        setIsOpen(true);
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
        setIsSubmitting(true);

        try {
            const submitData = new FormData();
            submitData.append("name", formData.name);
            submitData.append("bio", formData.bio);
            submitData.append("instagram", formData.instagram);
            if (selectedFile) {
                submitData.append("photo", selectedFile);
            }

            let response;
            if (isEditing && currentId) {
                response = await api.put(`/profile/${currentId}`, submitData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                response = await api.post("/profile", submitData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            if (response.data.success) {
                toast.success("Berhasil", {
                    description: isEditing ? "Profil berhasil diperbarui" : "Profil berhasil dibuat",
                });
                fetchProfiles();
                setIsOpen(false);
            }
        } catch (error: any) {
            console.error("Submit failed", error);
            toast.error("Gagal", {
                description: error.response?.data?.error || "Terjadi kesalahan saat menyimpan data.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus profil ini?")) return;

        try {
            await api.delete(`/profile/${id}`);
            toast.success("Berhasil", { description: "Profil berhasil dihapus" });
            fetchProfiles();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Gagal", { description: "Gagal menghapus profil" });
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
        <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Profil</h1>
                    <p className="text-muted-foreground">
                        Kelola data anggota dan profil mereka.
                    </p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Anggota
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile) => (
                    <Card key={profile.id} className="overflow-hidden group">
                        <div className="aspect-square relative overflow-hidden bg-muted">
                            <img
                                src={profile.photoUrl}
                                alt={profile.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                        </div>
                        <CardHeader className="p-4">
                            <CardTitle className="flex justify-between items-start text-lg">
                                <span>{profile.name}</span>
                            </CardTitle>
                            {profile.instagram && (
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <Instagram className="h-3 w-3 mr-1" />
                                    @{profile.instagram.replace('@', '')}
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                {profile.bio || "Tidak ada bio."}
                            </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenEdit(profile)}>
                                <Pencil className="h-3 w-3 mr-1" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDelete(profile.id)}>
                                <Trash2 className="h-3 w-3 mr-1" /> Hapus
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                {profiles.length === 0 && (
                    <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        <User className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>Belum ada profil anggota.</p>
                        <Button variant="link" onClick={handleOpenCreate}>Tambah sekarang</Button>
                    </div>
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Profil" : "Tambah Anggota Baru"}</DialogTitle>
                        <DialogDescription>
                            Isi informasi lengkap anggota di sini.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">

                        <div className="flex flex-col items-center justify-center space-y-4">
                            <Avatar className="h-24 w-24 border-2 border-border">
                                <AvatarImage src={previewUrl} className="object-cover" />
                                <AvatarFallback className="bg-muted"><User className="h-10 w-10 text-muted-foreground" /></AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" size="sm" className="relative overflow-hidden">
                                    <Upload className="mr-2 h-4 w-4" />
                                    {isEditing ? "Ganti Foto" : "Upload Foto"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        required={!isEditing} // Required only on create
                                    />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    placeholder="Contoh: John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="bio">Bio / Deskripsi Singkat</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Ceritakan sedikit tentang anggota ini..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="instagram">Username Instagram (Opsional)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">@</span>
                                    <Input
                                        id="instagram"
                                        placeholder="username"
                                        className="pl-8"
                                        value={formData.instagram}
                                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    "Simpan"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
