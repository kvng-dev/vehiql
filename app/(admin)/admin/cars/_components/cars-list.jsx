"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Car,
  Loader2,
  Plus,
  Search,
  Star,
  StarOff,
  MoreHorizontal,
  Eye,
  Trash2,
} from "lucide-react";
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
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import useFetch from "../../../../../hooks/use-fetch";
import {
  getCars,
  deleteCars,
  updateCarStatus,
  deleteCar,
} from "@/actions/cars";
import Image from "next/image";
import { formatCurrency } from "@/components/lib/helper";
import { Badge } from "@/components/ui/badge";
const CarsList = () => {
  const [search, setSearch] = useState("");
  const [carToDelete, setCarToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchCars(search);
  }, [search]);

  const {
    loading: loadingCars,
    data: carsData,
    fn: fetchCars,
    error: carsError,
  } = useFetch(getCars);

  const {
    loading: deletingCar,
    data: deleteResult,
    fn: deleteCarFn,
    error: deleteError,
  } = useFetch(deleteCar);

  const {
    loading: updatingCar,
    data: updateResult,
    fn: updateCarStatusFn,
    error: updateError,
  } = useFetch(updateCarStatus);

  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <Badge className="bg-green-500/60 hover:bg-green-300 text-green-900">
            Available
          </Badge>
        );
      case "UNAVAILABLE":
        return (
          <Badge className="text-amber-800 bg-amber-500/60 hover:bg-amber-300">
            Unavailable
          </Badge>
        );
      case "SOLD":
        return (
          <Badge className="text-blue-800 bg-blue-500/60 hover:bg-blue-300">
            Sold
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    fetchCars(search);
  };

  const handleToggleFeature = async (car) => {
    await updateCarStatusFn(car.id, { featured: !car.featured });
  };

  const handleStatusUpdate = async (car, newStatus) => {
    await updateCarStatusFn(car.id, { status: newStatus });
  };

  const handleDeleteCar = async (car) => {
    if (!carToDelete) return;

    await deleteCarFn(carToDelete.id);
    setCarToDelete(null);
    setShowDeleteDialog(false);
  };

  useEffect(() => {
    if (updateResult?.success) {
      toast.success("Car updated successfully");
      fetchCars(search);
    }
    if (deleteResult?.success) {
      toast.success("Car deleted successfully");
      fetchCars(search);
    }
  }, [updateResult, deleteResult]);

  useEffect(() => {
    if (carsError) {
      toast.error("Failed to load cars");
    }
    if (deleteError) {
      toast.success("Failed to delete car");
    }
    if (updateError) {
      toast.success("Failed to update car");
    }
  }, [carsError, deleteError, updateError]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Button
          onClick={() => router.push("/admin/cars/create")}
          className="flex items-center"
        >
          <Plus className="h-4 w-4" />
          Add Car
        </Button>

        <form onSubmit={handleSearchSubmit}>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              className="pl-9 w-full sm:w-60"
              value={search}
              placeholder="Search cars..."
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          {loadingCars && !carsData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : carsData?.success && carsData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]"></TableHead>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carsData.data.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell className="w-10 h-10 rounded-md overflow-hidden">
                        {car.images && car.images.length > 0 ? (
                          <Image
                            src={car.images[0]}
                            alt={`${car.make}  ${car.model}`}
                            width={40}
                            height={40}
                            className="w-full h-full object-contain"
                            priority
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Car className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {car.make} {car.model}
                      </TableCell>
                      <TableCell>{car.year}</TableCell>
                      <TableCell className="">
                        {formatCurrency(car.price)}
                      </TableCell>
                      <TableCell>{getStatusBadge(car.status)}</TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-9 w-9"
                          onClick={() => handleToggleFeature(car)}
                          disabled={updatingCar}
                        >
                          {car.featured ? (
                            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                          ) : (
                            <StarOff className="h-5 w-5 text-gray-400 " />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="p-0 w-8 h-8"
                              size="sm"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => router.push(`/cars/${car.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Status</DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(car, "AVAILABLE")
                              }
                              disabled={
                                car.status === "AVAILABLE" || updatingCar
                              }
                            >
                              Set Available
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(car, "UNAVAILABLE")
                              }
                              disabled={
                                car.status === "UNAVAILABLE" || updatingCar
                              }
                            >
                              Set Unavailable
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(car, "SOLD")}
                              disabled={car.status === "SOLD" || updatingCar}
                            >
                              Mark as Sold
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => {
                                setCarToDelete(car);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Car className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No cars found
              </h3>
              <p className="text-gray-500 mb-4">
                {search
                  ? "No cars match your search"
                  : "Your inventory is empty. Add cars to get started"}
              </p>
              <Button onClick={() => router.push("/admin/cars/create")}>
                Add Your First Car
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {carToDelete?.make}{" "}
              {carToDelete?.model} ({carToDelete?.year})? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deletingCar}
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={handleDeleteCar}
                disabled={deletingCar}
              >
                {deletingCar ? (
                  <>
                    Deleting...
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Delete Car"
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default CarsList;
