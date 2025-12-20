"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface JanjiPria {
  id: string;
  description: string;
  status: "pending" | "approve" | "rejected";
  createdAt: string;
}

export default function JanjiPriaPage() {
  const [data, setData] = useState<JanjiPria[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = async () => {
    try {
      const response = await api.get("/janji-pria");
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Error", {
        description: "Failed to fetch Janji Pria data. You may not have permission.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id: string, status: "approve" | "rejected") => {
    try {
      await api.put(`/janji-pria/${id}`, { status });
      toast.success("Success", {
        description: `Janji Pria marked as ${status}`,
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Error", {
        description: "Failed to update status",
      });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    setIsCreating(true);
    try {
        await api.post("/janji-pria", { description: newDescription });
        toast.success("Success", {
            description: "Janji Pria created successfully",
        });
        setIsCreateOpen(false);
        setNewDescription("");
        fetchData();
    } catch (error: any) {
        console.error("Create failed", error);
        toast.error("Error", {
            description: error.response?.data?.error || "Failed to create Janji Pria",
        });
    } finally {
        setIsCreating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Janji Pria Management</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create New
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Janji Pria</DialogTitle>
                    <DialogDescription>
                        Add a new promise to the list.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder="Enter the promise description..."
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isCreating}>
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No data found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-[300px] truncate" title={item.description}>
                    {item.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      item.status === "approve" ? "default" : 
                      item.status === "rejected" ? "destructive" : "secondary"
                    }>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.createdAt}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {item.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleStatusUpdate(item.id, "approve")}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleStatusUpdate(item.id, "rejected")}>
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
