import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Trash2, Globe, Lock, MapPin, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface Trip {
    id: number;
    title: string;
    description: string | null;
    isPublic: boolean;
    createdAt: string;
}

export default function TripDetail() {
    const { id } = useParams<{ id: string }>();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: trip, isLoading } = useQuery<Trip>({
        queryKey: ["trip", id],
        queryFn: async () => {
            const res = await fetch(`/api/trips/${id}`, { credentials: "include" });
            if (!res.ok) {
                if (res.status === 404) throw new Error("Trip not found");
                throw new Error("Failed to fetch trip");
            }
            return res.json();
        },
        enabled: !!id,
    });

    const deleteTripMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/trips/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to delete trip");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trips"] });
            toast({
                title: "Trip deleted",
                description: "Your trip has been deleted successfully.",
            });
            setLocation("/trips");
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to delete trip",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!trip) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Trip not found</h3>
                    <p className="text-muted-foreground mb-6">
                        This trip doesn't exist or you don't have access to it.
                    </p>
                    <Button onClick={() => setLocation("/trips")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Trips
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation("/trips")}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-3xl font-bold">{trip.title}</h1>
                            <Badge variant={trip.isPublic ? "default" : "secondary"} className="gap-1">
                                {trip.isPublic ? (
                                    <>
                                        <Globe className="w-3 h-3" />
                                        Public
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-3 h-3" />
                                        Private
                                    </>
                                )}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Created {new Date(trip.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="gap-2">
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete "{trip.title}" and all associated data.
                                    This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => deleteTripMutation.mutate()}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete Trip
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-6 md:grid-cols-3"
            >
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                {trip.description || "No description provided for this trip."}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Itinerary</CardTitle>
                            <CardDescription>Stops and activities for this trip</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground mb-4">No stops added yet</p>
                                <Button variant="outline" size="sm">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Add First Stop
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <MapPin className="w-4 h-4" />
                                Add Stop
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Calendar className="w-4 h-4" />
                                Build Itinerary
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Trip Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Stops</span>
                                <span className="font-semibold">0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Activities</span>
                                <span className="font-semibold">0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Budget</span>
                                <span className="font-semibold">$0</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
}
