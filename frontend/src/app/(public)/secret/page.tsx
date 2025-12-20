"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JanjiPria {
    id: string;
    description: string;
    status: string;
    createdAt: string;
    creator_name?: string;
}

export default function SecretPage() {
    const [data, setData] = useState<JanjiPria[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("secretToken");
        if (!token) {
            router.replace("/secret-login");
            return;
        }

        const fetchData = async () => {
            try {
                const response = await api.get("/janji-pria");
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
                if ((error as any).response?.status === 401 || (error as any).response?.status === 403) {
                    localStorage.removeItem("secretToken");
                    router.replace("/secret-login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("secretToken");
        router.replace("/secret-login");
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8" /></div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Janji Pria Archive</h1>
                <Button variant="outline" onClick={handleLogout} className="gap-2">
                    <LogOut size={16} /> Logout
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((item) => (
                    <Card key={item.id}>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">{item.creator_name || "Anonymous"}</CardTitle>
                            <span className={`text-xs px-2 py-1 rounded-full w-fit ${
                                item.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                item.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {item.status.toUpperCase()}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{item.description}</p>
                            <p className="text-xs text-muted-foreground mt-4">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {data.length === 0 && (
                <div className="text-center text-muted-foreground py-20">
                    No records found.
                </div>
            )}
        </div>
    );
}
