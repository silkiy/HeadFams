"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export default function SettingsPage() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || password.length < 8) {
            toast.error("Error", { description: "Password must be at least 8 characters" });
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/set-secret-password", { password });
            toast.success("Success", { description: "Secret password updated successfully" });
            setPassword("");
        } catch (error: any) {
            console.error(error);
            toast.error("Error", { description: error.response?.data?.error || "Failed to update password" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <div className="grid gap-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Secret Login Configuration</CardTitle>
                        <CardDescription>
                            Set the password used to access the hidden "Janji Pria" archive from the footer lock icon.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="secret-password">New Secret Password</Label>
                                <Input
                                    id="secret-password"
                                    type="password"
                                    placeholder="Enter new secret password..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={8}
                                    required
                                />
                                <p className="text-sm text-muted-foreground">
                                    Must be at least 8 characters long.
                                </p>
                            </div>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Configuration
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
