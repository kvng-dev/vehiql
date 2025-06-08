"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Clock,
  Shield,
  Save,
  Loader2,
  Search,
  Users,
  UserX,
} from "lucide-react/dist/cjs/lucide-react";
import useFetch from "@/hooks/use-fetch";
import {
  getDealershipInfo,
  getUsers,
  saveWorkingHours,
  updateUserRole,
} from "@/actions/settings";

const DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

const SettingsForm = () => {
  const [workingHours, setWorkingHours] = useState(
    DAYS.map((day) => ({
      dayOfWeek: day.value,
      openTime: "09:00",
      closeTime: "18:00",
      isOpen: day.value !== "SUNDAY", // Closed on Sunday
    }))
  );

  const [userSearch, setUserSearch] = useState("");
  const {
    loading: fetchSettings,
    fn: fetchDealershipInfo,
    data: settingsData,
    error: settingsError,
  } = useFetch(getDealershipInfo);

  useEffect(() => {
    if (settingsData?.success && settingsData?.data) {
      const dealership = settingsData.data;

      if (dealership?.workingHours.length > 0) {
        const mappedHours = DAYS.map((day) => {
          const hourData = dealership.workingHours.find(
            (h) => h.dayOfWeek === day.value
          );

          if (hourData) {
            return {
              dayOfWeek: hourData.dayOfWeek,
              openTime: hourData.openTime,
              closeTime: hourData.closeTime,
              isOpen: hourData.isOpen,
            };
          }
          console.log("No working hours found for", day.value);
          return {
            dayOfWeek: day.value,
            openTime: "09:00",
            closeTime: "18:00",
            isOpen: day.value !== "SUNDAY",
          };
        });

        setWorkingHours(mappedHours);
      }
    }
  }, [settingsData]);

  const {
    loading: savingHours,
    fn: saveHours,
    data: saveResult,
    error: saveError,
  } = useFetch(saveWorkingHours);

  const {
    loading: fetchingUsers,
    fn: fetchUsers,
    data: userData,
    error: userError,
  } = useFetch(getUsers);

  const {
    loading: updatingRole,
    fn: updateRole,
    data: updateRoleResult,
    error: updateRoleError,
  } = useFetch(updateUserRole);

  useEffect(() => {
    fetchDealershipInfo();
    fetchUsers();
  }, []);

  const handleWorkingHoursChange = (index, field, value) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value,
    };
    setWorkingHours(updatedHours);
  };

  const handleSaveHours = async () => {
    await saveHours(workingHours);
  };

  useEffect(() => {
    if (updateRoleResult?.success) {
      fetchUsers();
    }
  }, [updateRoleResult]);

  useEffect(() => {
    if (saveResult?.success) {
      fetchDealershipInfo();
      toast.success("Working hours saved successfully!");
    }
  }, [saveResult]);

  const filteredUsers = userData?.success
    ? userData?.data.filter(
        (user) =>
          user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (settingsError) {
      toast.error(`Failed to load dealership settings`);
    }
    if (userError) {
      toast.error(`Failed to load users`);
    }

    if (updateRoleError) {
      toast.error(`Failed to update user role. ${updateRoleError.message}`);
    }

    if (saveError) {
      toast.error(`Failed to save working hours. ${saveError.message}`);
    }
  }, [settingsError, userError, saveError, updateRoleError]);

  const handleMakeAdmin = async (user) => {
    if (
      confirm(
        `Are you sure you want to make ${
          user.name || user.email
        } an admin? This will grant them full access to the admin portal.`
      )
    ) {
      await updateRole(user.id, "ADMIN");
      toast.success(`${user.name || user.email} has been made an admin.`);
    }
  };
  const handleRemoveAdmin = async (user) => {
    if (
      confirm(
        `Are you sure you want to remove admin privileges from ${
          user.name || user.email
        }? They will no longer have access to the admin portal.`
      )
    ) {
      await updateRole(user.id, "USER");
      toast.success(`${user.name || user.email} is no longer an admin.`);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hours">
        <TabsList>
          <TabsTrigger value="hours">
            <Clock className="h-4 w-4 mr-2" />
            Working Hours
          </TabsTrigger>
          <TabsTrigger value="admins">
            <Shield className="h-4 w-4 mr-2" />
            Admin Users
          </TabsTrigger>
        </TabsList>
        <TabsContent value="hours" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>
                Set your dealership&apos;s working hours for each day of the
                week.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="space-y-4">
                {DAYS.map((day, index) => {
                  return (
                    <div
                      key={day.value}
                      className="grid grid-cols-12 px-4 py-3 rounded-lg hover:bg-slate-50 gap-4 items-center"
                    >
                      <div className="col-span-3 md:col-span-2">
                        <div className="font-medium text-sm">{day.label}</div>
                      </div>

                      <div className="col-span-9 md:col-span-2 flex items-center">
                        <Checkbox
                          id={`is-open-${day.value}`}
                          checked={workingHours[index]?.isOpen}
                          onCheckedChange={(checked) => {
                            handleWorkingHoursChange(index, "isOpen", checked);
                          }}
                        />
                        <Label
                          htmlFor={`is-open-${day.value}`}
                          className="ml-2"
                        >
                          {workingHours[index]?.isOpen ? "Open" : "Closed"}
                        </Label>
                      </div>

                      {workingHours[index]?.isOpen && (
                        <div className="col-span-6 md:col-span-8 grid grid-cols-3 items-center">
                          <div>
                            <div className="flex items-center w-full">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              <Input
                                type="time"
                                value={workingHours[index]?.openTime}
                                onChange={(e) =>
                                  handleWorkingHoursChange(
                                    index,
                                    "openTime",
                                    e.target.value
                                  )
                                }
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <div className="text-center col-span-1 text-sm">
                            to
                          </div>

                          <div>
                            <div className="flex items-center">
                              <Input
                                type="time"
                                value={workingHours[index]?.closeTime}
                                onChange={(e) =>
                                  handleWorkingHoursChange(
                                    index,
                                    "closeTime",
                                    e.target.value
                                  )
                                }
                                className="text-sm"
                              />
                              <Clock className="h-4 w-4 ml-2 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      )}

                      {!workingHours[index]?.isOpen && (
                        <div className="col-span-6 md:col-span-8 text-sm text-gray-500">
                          <span className="italic">Closed all day</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveHours} disabled={savingHours}>
                  {savingHours ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Working Hours
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admins" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>
                Manage admin users and their roles.
              </CardDescription>
            </CardHeader>
            <CardContent className="">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-9 w-full"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              {fetchingUsers ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : userData?.success && userData?.data.length > 0 ? (
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
                                {user.imageUrl ? (
                                  <img
                                    src={user.imageUrl}
                                    alt={user.name || "user"}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <Users className="h-8 w-8 text-gray-400" />
                                )}
                              </div>
                              <span>{user.name || "Unnamed User"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                user.role === "ADMIN"
                                  ? "bg-green-800"
                                  : "bg-gray-800"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {user.role === "ADMIN" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => handleRemoveAdmin(user)}
                                disabled={updatingRole}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Remove Admin
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMakeAdmin(user)}
                                disabled={updatingRole}
                              >
                                <Shield className="h-4 w-4 mr-2 fill-blue-600" />
                                Make Admin
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    No users found
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {userSearch
                      ? "No users match your search."
                      : "No users available yet."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default SettingsForm;
